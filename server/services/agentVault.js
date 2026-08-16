import * as vaultManager from './vaultManager.js';
import * as dbService from './dbService.js';
import { generateDeepReviewerWithGemini } from './geminiService.js';
import { extractWikilinksAndTags } from './nlpEngine.js';

/**
 * Seed or update a document in the vault directly (Agent Access Bridge)
 * @param {Object} docData 
 * @returns {Promise<Object>}
 */
export async function seedVaultDocument({
  title,
  type = 'note',
  rawText = '',
  reviewer = null,
  flashcards = [],
  quizQuestions = [],
  tags = [],
  images = [],
  chapters = [],
  sourceUrl = ''
}) {
  const meta = extractWikilinksAndTags(rawText);
  const mergedTags = Array.from(new Set([...tags, ...meta.tags]));

  const doc = await vaultManager.saveDocumentAsync({
    title: title || 'Agent Seeded Document',
    type,
    rawText,
    sourceUrl,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
    images,
    chapters,
    reviewer,
    tags: mergedTags,
    entities: reviewer?.entities || meta.entities,
    wikilinks: reviewer?.wikilinks || meta.wikilinks,
    flashcards: flashcards.length > 0 ? flashcards : (reviewer?.flashcards || []),
    quizQuestions: quizQuestions.length > 0 ? quizQuestions : (reviewer?.quizQuestions || [])
  });

  return doc;
}

/**
 * Generate an AI summary & study reviewer for any existing document by ID
 * @param {string} docId 
 * @returns {Promise<Object>}
 */
export async function summarizeVaultDocument(docId) {
  const doc = vaultManager.getDocumentById(docId);
  if (!doc) {
    throw new Error(`Document with ID "${docId}" not found in vault.`);
  }

  const reviewer = await generateDeepReviewerWithGemini({
    title: doc.title,
    sourceType: doc.type,
    content: doc.rawText
  });

  const updatedDoc = await vaultManager.saveDocumentAsync({
    ...doc,
    reviewer,
    tags: Array.from(new Set([...(doc.tags || []), ...(reviewer.tags || [])])),
    entities: reviewer.entities || doc.entities,
    wikilinks: reviewer.wikilinks || doc.wikilinks,
    flashcards: reviewer.flashcards || doc.flashcards,
    quizQuestions: reviewer.quizQuestions || doc.quizQuestions
  });

  return updatedDoc;
}

/**
 * List all documents currently stored in the vault
 */
export async function listVaultDocuments() {
  return await vaultManager.getAllDocumentsAsync();
}
