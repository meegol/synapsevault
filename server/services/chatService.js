import axios from 'axios';
import config from '../config.js';
import * as vaultManager from './vaultManager.js';

/**
 * Query the vault documents and return answers with source citations using multi-key failover
 * @param {Object} params
 * @param {string} params.message
 * @param {Array<{role: string, content: string}>} params.history
 * @param {string} [params.scopeDocId]
 * @returns {Promise<{reply: string, sources: Array<Object>}>}
 */
export async function chatWithVault({ message, history = [], scopeDocId = null }) {
  const primaryModel = config.selectedModel || 'gemini-2.5-flash';
  const modelsToTry = [primaryModel, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean);
  const keysToTry = (config.apiKeys || [config.geminiApiKey]).filter(Boolean);

  if (keysToTry.length === 0) {
    throw new Error('Gemini API key is required to query vault documents.');
  }

  const allDocs = vaultManager.getAllDocuments();
  let contextDocs = [];
  
  if (scopeDocId) {
    const single = allDocs.find(d => d.id === scopeDocId);
    if (single) contextDocs = [single];
  } else {
    contextDocs = allDocs;
  }

  if (contextDocs.length === 0) {
    return {
      reply: "The vault is currently empty. Upload a PDF, add a YouTube link, or create a note to begin querying your notes.",
      sources: []
    };
  }

  const sources = [];
  const documentContextBlocks = contextDocs.map(doc => {
    sources.push({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      tags: doc.tags || []
    });

    const reviewer = doc.reviewer || {};
    const sectionsText = (reviewer.comprehensiveSections || []).map(s => 
      `### ${s.sectionTitle}\n${s.detailedNotesMarkdown}\n` +
      (s.keyTerms?.length ? `Key Terms: ${s.keyTerms.map(t => `${t.term}: ${t.definition}`).join('; ')}\n` : '') +
      (s.formulasOrRules?.length ? `Formulas/Rules: ${s.formulasOrRules.map(f => `${f.name}: ${f.formula}`).join('; ')}\n` : '')
    ).join('\n');

    const glossaryText = (reviewer.glossary || []).map(g => `${g.term}: ${g.definition}`).join('; ');
    const chaptersText = (doc.chapters || []).map(c => `[${c.timestamp}] ${c.text}`).join('\n');

    return `
---
DOCUMENT: "${doc.title}" (${doc.type.toUpperCase()})
TAGS: ${(doc.tags || []).join(', ')}
${doc.author ? `AUTHOR: ${doc.author}` : ''}
${doc.sourceUrl ? `URL: ${doc.sourceUrl}` : ''}

SUMMARY:
${reviewer.executiveSummary || (doc.rawText ? doc.rawText.slice(0, 500) : '')}

SECTIONS & NOTES:
${sectionsText || (doc.rawText ? doc.rawText.slice(0, 3000) : '')}

${glossaryText ? `GLOSSARY:\n${glossaryText}\n` : ''}
${chaptersText ? `CHAPTERS:\n${chaptersText}\n` : ''}
---
`;
  }).join('\n\n');

  const systemInstructions = `
You are a knowledgeable study assistant with access to the user's personal document vault.
Answer user questions directly and clearly based on the provided vault context.
Reference specific source titles in brackets like **[PDF: Title]** or **[YouTube: Title @ 04:15]**.
Reference related concept links like [[Concept Name]] where helpful.
If the question is unrelated to the vault contents, answer politely and note that it is outside the vault scope.
`;

  const contents = [];
  
  history.slice(-8).forEach(turn => {
    contents.push({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.content }]
    });
  });

  const currentPrompt = `
VAULT CONTEXT (${contextDocs.length} Documents):
${documentContextBlocks}

QUESTION:
${message}
`;

  contents.push({
    role: 'user',
    parts: [{ text: currentPrompt }]
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstructions }]
    },
    generationConfig: {
      temperature: 0.3,
      topP: 0.95
    }
  };

  let lastError = null;

  for (let k = 0; k < keysToTry.length; k++) {
    const currentKey = keysToTry[k];

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentKey}`;
        const response = await axios.post(endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return {
            reply,
            sources
          };
        }
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        console.warn(`[Vault Chatbot] Key ${k+1}/${keysToTry.length} with ${currentModel} returned ${status || error.message}`);
        
        if (status === 429) {
          console.warn(`[Vault Chatbot] Key quota exceeded. Switching to backup key...`);
          break;
        }
      }
    }
  }

  throw lastError || new Error('All model and key attempts failed.');
}
