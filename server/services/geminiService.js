import axios from 'axios';
import config from '../config.js';

/**
 * Clean and parse JSON from model output
 * @param {string} rawText 
 * @returns {Object}
 */
export function extractJsonFromText(rawText) {
  if (!rawText) throw new Error('Empty response from model');
  
  let cleaned = rawText.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSubstring);
    }
    throw new Error(`Failed to parse structured JSON: ${err.message}`);
  }
}

/**
 * Generate detailed reviewer, flashcards, and concept links with key pooling & model fallback
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.sourceType
 * @param {string} params.content
 * @param {string} [params.extraContext]
 * @returns {Promise<Object>}
 */
import { sanitizeDocumentText } from '../utils/textSanitizer.js';

export async function generateDeepReviewerWithGemini({ title, sourceType, content, extraContext = '' }) {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];
  const keysToTry = (config.apiKeys || [config.geminiApiKey]).filter(Boolean);

  if (keysToTry.length === 0) {
    throw new Error('Gemini API key is missing in server configuration.');
  }

  const cleanContent = sanitizeDocumentText(content);

  const systemInstructions = `
You are an expert academic knowledge extraction and master reviewer synthesis engine.
Given source material, extract an exhaustive, beautifully formatted study reviewer, active recall flashcards, practice questions, and concept relationship links.

CRITICAL FORMATTING & NOISE REDUCTION RULES:
1. NEVER output raw Table of Contents dumps, page numbers, dots (...), or repetitive watermark author tags (e.g. "[Notes by ...]").
2. Executive Summary MUST be formatted in rich, clean Markdown with structured paragraphs, bold emphasis on core mechanisms, and key bullet points.
3. Detailed Notes MUST use clear Markdown structure:
   - Section subheadings (### Subtopic)
   - Numbered steps (1. 2. 3.) for processes and cycles
   - Highlighted bullet points (- **Concept/Term**: Detailed explanation)
   - Code/Formula blocks for operational rules
4. Always explain concepts thoroughly with practical nuances, rules of thumb, and cause-and-effect relationships.

Return valid JSON adhering to this schema:
{
  "title": "Clean Descriptive Document Title",
  "executiveSummary": "Rich 2-3 paragraph markdown summary with bold key points and clear structural context.",
  "keyTakeaways": [
    "Key takeaway point with full explanatory context"
  ],
  "comprehensiveSections": [
    {
      "sectionTitle": "Clear Section Title",
      "detailedNotesMarkdown": "Thorough, beautifully structured markdown notes with ### headings, - **bold sub-points**, and numbered steps.",
      "keyTerms": [
        { "term": "Term", "definition": "Clear, precise operational definition" }
      ],
      "formulasOrRules": [
        { "name": "Formula or Rule Name", "formula": "Formula (LaTeX format for math if applicable)", "explanation": "Context, criteria, and usage" }
      ]
    }
  ],
  "glossary": [
    { "term": "Term", "definition": "Definition", "category": "Category" }
  ],
  "tags": [
    "tag1", "tag2"
  ],
  "entities": [
    {
      "name": "Concept Name",
      "type": "Concept",
      "description": "Brief description",
      "relatedTo": ["Related Concept"]
    }
  ],
  "wikilinks": [
    "[[Concept A]]", "[[Concept B]]"
  ],
  "flashcards": [
    {
      "question": "Question testing key concept",
      "answer": "Detailed answer",
      "category": "Topic",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "quizQuestions": [
    {
      "question": "Conceptual question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of correct answer"
    }
  ]
}
`;

  const safeContent = cleanContent.length > 800000 ? cleanContent.slice(0, 800000) + '\n[Truncated]' : cleanContent;

  const prompt = `
TITLE: ${title}
SOURCE TYPE: ${sourceType.toUpperCase()}
${extraContext ? `METADATA:\n${extraContext}\n` : ''}

CONTENT:
${safeContent}

Generate the structured JSON reviewer as specified above. Return ONLY the JSON object.
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemInstructions + '\n\n' + prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  let lastError = null;

  // Try each API key in the pool, and each model
  for (let k = 0; k < keysToTry.length; k++) {
    const currentKey = keysToTry[k];

    for (let m = 0; m < modelsToTry.length; m++) {
      const curModel = modelsToTry[m];
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:generateContent?key=${currentKey}`;
        const response = await axios.post(endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000
        });

        const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return extractJsonFromText(responseText);
        }
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        console.warn(`[Reviewer Engine] Key ${k+1}/${keysToTry.length} with ${curModel} returned ${status || err.message}`);
      }
    }
  }

  throw lastError || new Error('Failed to generate reviewer across all available API keys and models.');
}
