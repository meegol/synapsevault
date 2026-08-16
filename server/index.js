import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import config, { updateConfig } from './config.js';
import { extractPdfText } from './services/pdfExtractor.js';
import { extractYouTubeData } from './services/youtubeExtractor.js';
import { generateDeepReviewerWithGemini } from './services/geminiService.js';
import { generateHeuristicReviewer, extractKeywords, extractWikilinksAndTags } from './services/nlpEngine.js';
import { chatWithVault } from './services/chatService.js';
import { authMiddleware, authenticate, verifyToken, invalidateToken } from './services/authService.js';
import * as vaultManager from './services/vaultManager.js';
import { seedVaultDocument, summarizeVaultDocument } from './services/agentVault.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply Auth Protection to all protected API routes
app.use(authMiddleware);

// Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// Multer storage for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `pdf-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  }
});

// Helper for generating reviewer using Gemini or NLP Fallback
async function processContentToReviewer({ title, sourceType, content, extraContext = '' }) {
  try {
    const hasKeys = config.apiKeys && config.apiKeys.length > 0 && config.apiKeys[0] !== '';
    if (config.provider !== 'local_nlp' && hasKeys) {
      console.log(`[Reviewer Engine] Generating deep reviewer for "${title}" via Gemini (${config.selectedModel})...`);
      const reviewer = await generateDeepReviewerWithGemini({
        title,
        sourceType,
        content,
        extraContext
      });
      if (reviewer && reviewer.comprehensiveSections && reviewer.comprehensiveSections.length > 0) {
        return reviewer;
      }
    }
  } catch (geminiErr) {
    console.warn(`[Reviewer Engine] Gemini generation error: ${geminiErr.message}. Falling back to Smart NLP Engine...`);
  }

  // Fallback to local NLP synthesis
  console.log(`[Reviewer Engine] Generating synthesis using Smart NLP Engine for "${title}"...`);
  return generateHeuristicReviewer({ title, sourceType, content });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 0. Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const token = authenticate(password);
  if (!token) {
    return res.status(401).json({ error: 'Incorrect vault password.' });
  }
  res.json({ success: true, token });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    invalidateToken(authHeader.slice(7).trim());
  }
  res.json({ success: true });
});

app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: true,
    hasApiKey: Boolean(config.geminiApiKey)
  });
});

// 1. Health & Config
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    selectedModel: config.selectedModel,
    provider: config.provider,
    hasApiKey: Boolean(config.geminiApiKey)
  });
});

app.get('/api/settings', (req, res) => {
  res.json({
    geminiApiKey: config.geminiApiKey ? `${config.geminiApiKey.slice(0, 8)}...${config.geminiApiKey.slice(-4)}` : '',
    hasKey: Boolean(config.geminiApiKey),
    selectedModel: config.selectedModel,
    provider: config.provider,
    availableModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', recommended: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', recommended: false }
    ]
  });
});

app.post('/api/settings', (req, res) => {
  const { geminiApiKey, selectedModel, provider } = req.body;
  updateConfig({ geminiApiKey, selectedModel, provider });
  res.json({
    success: true,
    message: 'Settings updated successfully',
    selectedModel: config.selectedModel,
    provider: config.provider
  });
});

// 2. Upload and Process PDF (Direct Obsidian Extraction)
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, '');

    console.log(`[PDF Ingestion] Parsing PDF: ${req.file.originalname} (${req.file.size} bytes)`);
    const pdfData = await extractPdfText(filePath);

    if (!pdfData.rawText || pdfData.rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract readable text from PDF (it may be scanned/image-only).' });
    }

    const meta = extractWikilinksAndTags(pdfData.rawText);

    const doc = await vaultManager.saveDocumentAsync({
      title: originalName,
      type: 'pdf',
      sourceUrl: `/uploads/${req.file.filename}`,
      wordCount: pdfData.wordCount,
      rawText: pdfData.rawText,
      images: pdfData.images || [],
      tags: meta.tags,
      entities: meta.entities,
      wikilinks: meta.wikilinks,
      reviewer: null
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('PDF Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF' });
  }
});

// 2b. Direct Ingest of Parsed PDF Text & Figures (Serverless Direct Obsidian Vault)
app.post('/api/ingest-pdf-text', async (req, res) => {
  try {
    const { title, rawText, numPages, wordCount, images = [] } = req.body;
    
    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'No readable text content provided in PDF.' });
    }

    const cleanTitle = title || 'Uploaded Document';
    console.log(`[PDF Ingestion] Saving raw document "${cleanTitle}" (${wordCount || 0} words, ${images.length} images)...`);

    const meta = extractWikilinksAndTags(rawText);

    const doc = await vaultManager.saveDocumentAsync({
      title: cleanTitle,
      type: 'pdf',
      sourceUrl: '',
      wordCount: wordCount || rawText.split(/\s+/).filter(Boolean).length,
      rawText,
      images: images.slice(0, 15),
      tags: meta.tags,
      entities: meta.entities,
      wikilinks: meta.wikilinks,
      reviewer: null
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('PDF Text Ingest Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document content' });
  }
});

// 3. Ingest YouTube Video Link
app.post('/api/fetch-youtube', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ error: 'YouTube video URL is required.' });
    }

    console.log(`[YouTube Ingestion] Processing URL: ${videoUrl}`);
    const ytData = await extractYouTubeData(videoUrl);
    const meta = extractWikilinksAndTags(ytData.rawText);

    const doc = await vaultManager.saveDocumentAsync({
      title: ytData.title,
      type: 'youtube',
      sourceUrl: ytData.videoUrl,
      thumbnailUrl: ytData.thumbnailUrl,
      author: ytData.author,
      durationFormatted: ytData.durationFormatted,
      wordCount: ytData.wordCount,
      rawText: ytData.rawText,
      chapters: ytData.chapters,
      tags: meta.tags,
      entities: meta.entities,
      wikilinks: meta.wikilinks,
      reviewer: null
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('YouTube Processing Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process YouTube video' });
  }
});

// 4. Create Custom Markdown Note
app.post('/api/create-note', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const meta = extractWikilinksAndTags(content);
    const mergedTags = Array.from(new Set([...(tags || []), ...meta.tags]));

    const doc = await vaultManager.saveDocumentAsync({
      title,
      type: 'note',
      rawText: content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      tags: mergedTags,
      entities: meta.entities,
      wikilinks: meta.wikilinks,
      reviewer: null
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('Create Note Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create note' });
  }
});

// 5. Document List, Detail, Update & Delete
app.get('/api/documents', async (req, res) => {
  const docs = await vaultManager.getAllDocumentsAsync();
  res.json({ documents: docs });
});

app.get('/api/documents/:id', (req, res) => {
  const doc = vaultManager.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json({ document: doc });
});

app.put('/api/documents/:id', async (req, res) => {
  const existingDoc = vaultManager.getDocumentById(req.params.id);
  if (!existingDoc) return res.status(404).json({ error: 'Document not found' });

  const rawText = req.body.rawText !== undefined ? req.body.rawText : existingDoc.rawText;
  const meta = extractWikilinksAndTags(rawText);

  const updatedPayload = {
    ...existingDoc,
    ...req.body,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
    tags: Array.from(new Set([...(req.body.tags || existingDoc.tags || []), ...meta.tags])),
    entities: Array.from(new Set([...(existingDoc.entities || []), ...meta.entities])),
    wikilinks: Array.from(new Set([...(existingDoc.wikilinks || []), ...meta.wikilinks]))
  };

  const updated = await vaultManager.saveDocumentAsync(updatedPayload);
  res.json({ success: true, document: updated });
});

app.delete('/api/documents/:id', (req, res) => {
  vaultManager.deleteDocument(req.params.id);
  res.json({ success: true });
});

// On-demand AI Summarization for a Note
app.post('/api/documents/:id/summarize', async (req, res) => {
  try {
    const updatedDoc = await summarizeVaultDocument(req.params.id);
    res.json({ success: true, document: updatedDoc });
  } catch (err) {
    console.error('On-demand Summarize Error:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize document with AI' });
  }
});

// Agent Direct Document Seeding Endpoint
app.post('/api/agent/seed-document', async (req, res) => {
  try {
    const doc = await seedVaultDocument(req.body);
    res.json({ success: true, document: doc });
  } catch (err) {
    console.error('Agent Seed Error:', err);
    res.status(500).json({ error: err.message || 'Failed to seed document via agent' });
  }
});

// Sync client persistent vault to server session
app.post('/api/sync-vault', (req, res) => {
  const { documents } = req.body;
  const synced = vaultManager.syncVault(documents);
  res.json({ success: true, count: synced.length });
});

// 6. Obsidian Knowledge Graph
app.get('/api/graph', (req, res) => {
  const graph = vaultManager.getKnowledgeGraphData();
  res.json(graph);
});

// 7. Flashcard Review update
app.post('/api/documents/:id/flashcard-update', (req, res) => {
  const { cardIndex, isMastered } = req.body;
  const doc = vaultManager.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const flashcardStats = doc.flashcardStats || { totalReviews: 0, mastered: 0 };
  flashcardStats.totalReviews += 1;
  if (isMastered) flashcardStats.mastered += 1;

  const updated = vaultManager.updateDocument(req.params.id, { flashcardStats });
  res.json({ success: true, document: updated });
});

// 8. Quiz Attempt Recording
app.post('/api/documents/:id/quiz-result', (req, res) => {
  const { score, totalQuestions } = req.body;
  const doc = vaultManager.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const percentage = Math.round((score / totalQuestions) * 100);
  const quizStats = doc.quizStats || { attempts: 0, bestScore: 0 };
  quizStats.attempts += 1;
  quizStats.bestScore = Math.max(quizStats.bestScore, percentage);

  const updated = vaultManager.updateDocument(req.params.id, { quizStats });
  res.json({ success: true, document: updated });
});

// 9. AI Chatbot / Vault Oracle
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, scopeDocId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const response = await chatWithVault({ message, history, scopeDocId });
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chat response' });
  }
});

// 10. Export Vault archive
app.get('/api/export-vault', (req, res) => {
  const docs = vaultManager.getAllDocuments();
  res.json({
    vaultName: 'SynapseVault',
    exportedAt: new Date().toISOString(),
    totalDocuments: docs.length,
    documents: docs
  });
});

// Serve frontend build if available
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Export app for Vercel serverless deployment
export default app;

// Start standalone server if run directly
if (process.env.NODE_ENV !== 'vercel' && process.env.VERCEL !== '1') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SynapseVault Running on http://localhost:${PORT}`);
    console.log(`🧠 AI Engine: Google Gemini 3.7 Flash`);
    console.log(`🔐 Vault Password: migol`);
    console.log(`📁 Vault Directory: ${config.vaultDir}`);
    console.log(`=======================================================`);
  });
}
