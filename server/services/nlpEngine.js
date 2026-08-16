/**
 * Built-in Natural Language Processing & Heuristic Synthesis Engine
 * Provides offline/instant fallback extraction, TF-IDF keyphrase analysis,
 * concept entity linking, and reviewer generation.
 */

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'also', 'within', 'use', 'using', 'used',
  'system', 'data', 'one', 'two', 'new', 'well', 'many', 'may', 'much', 'see', 'first', 'said'
]);

/**
 * Extract dominant keywords and entities using frequency & TF-IDF heuristic
 * @param {string} text 
 * @param {number} maxKeywords 
 * @returns {Array<{term: string, score: number}>}
 */
export function extractKeywords(text, maxKeywords = 12) {
  if (!text) return [];

  // Match words and 2-word phrases
  const wordRegex = /\b[a-zA-Z]{3,}\b/g;
  const words = (text.match(wordRegex) || []).map(w => w.toLowerCase());
  
  const freqMap = new Map();
  words.forEach(w => {
    if (!STOP_WORDS.has(w)) {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    }
  });

  // Extract Capitalized Multi-word Entity Candidates (e.g. "Neural Networks", "Attention Mechanism")
  const entityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  const entities = text.match(entityRegex) || [];
  entities.forEach(e => {
    const clean = e.trim();
    if (clean.length > 5) {
      freqMap.set(clean, (freqMap.get(clean) || 0) + 3); // Boost entity weights
    }
  });

  const sorted = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([term, score]) => ({
      term: term.charAt(0).toUpperCase() + term.slice(1),
      score
    }));

  return sorted;
}

/**
 * Extract wikilinks [[Concept]] and hashtags #tag directly from raw document text
 * @param {string} text 
 * @returns {{ wikilinks: string[], tags: string[], entities: Array<{name: string, type: string, description: string}> }}
 */
export function extractWikilinksAndTags(text) {
  if (!text || typeof text !== 'string') return { wikilinks: [], tags: [], entities: [] };

  // Match [[Concept Name]]
  const wikilinkMatches = text.match(/\[\[(.*?)\]\]/g) || [];
  const cleanWikilinks = Array.from(new Set(wikilinkMatches.map(w => w.replace(/^\[\[/, '').replace(/\]\]$/, '').trim()))).filter(Boolean);

  // Match #tag
  const tagMatches = text.match(/#([a-zA-Z0-9_-]+)/g) || [];
  const cleanTags = Array.from(new Set(tagMatches.map(t => t.replace(/^#/, '').trim()))).filter(Boolean);

  // Extract capitalized keywords as entity candidates if no explicit wikilinks exist
  const keywords = extractKeywords(text, 6);

  const entities = cleanWikilinks.map(name => ({
    name,
    type: 'Concept',
    description: `Wikilink concept in document`
  }));

  if (entities.length === 0) {
    keywords.forEach(k => {
      entities.push({
        name: k.term,
        type: 'Concept',
        description: `Key topic extracted from text`
      });
    });
  }

  return {
    wikilinks: cleanWikilinks.map(w => `[[${w}]]`),
    tags: cleanTags,
    entities
  };
}

import { sanitizeDocumentText } from '../utils/textSanitizer.js';

/**
 * Generate a comprehensive fallback reviewer without an LLM
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.sourceType
 * @param {string} params.content
 * @returns {Object}
 */
export function generateHeuristicReviewer({ title, sourceType, content }) {
  const cleanText = sanitizeDocumentText(content);
  
  // Extract real explanatory sentences (filter out TOC lines and short titles)
  const rawSentences = cleanText
    .split(/(?<=[.?!])\s+|\n\n+/)
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => {
      if (s.length < 35) return false;
      if (/^(?:table of contents|contents|page \d|ep \d)/i.test(s)) return false;
      // Skip lines that have excessive numbers or dots (TOC artifacts)
      const numRatio = (s.match(/\d/g) || []).length / s.length;
      return numRatio < 0.15;
    });

  const sentences = rawSentences.length > 0 ? rawSentences : cleanText.split('\n').filter(s => s.trim().length > 20);

  const keywords = extractKeywords(cleanText, 10);
  const tags = keywords.slice(0, 5).map(k => k.term.toLowerCase().replace(/\s+/g, '-'));

  // Split into chunks for sections
  const chunkSize = Math.max(2, Math.ceil(sentences.length / 4));
  const sections = [];

  for (let i = 0; i < sentences.length; i += chunkSize) {
    const chunkSentences = sentences.slice(i, i + chunkSize);
    const chunkKeywords = extractKeywords(chunkSentences.join(' '), 4);

    const sectionTitle = chunkKeywords[0] ? `${chunkKeywords[0].term} & Core Principles` : `Section ${sections.length + 1}`;
    
    // Format detailed notes with structured markdown bullets and bold keywords
    const formattedNotes = chunkSentences.map((s, sIdx) => {
      // Bold the first few words or key concepts
      const words = s.split(' ');
      if (words.length > 4) {
        const lead = words.slice(0, 3).join(' ');
        const rest = words.slice(3).join(' ');
        return `- **${lead}** ${rest}`;
      }
      return `- ${s}`;
    }).join('\n\n');

    sections.push({
      sectionTitle,
      detailedNotesMarkdown: `### Overview & Core Concepts\n\n${formattedNotes}`,
      keyTerms: chunkKeywords.map(k => ({
        term: k.term,
        definition: `Fundamental concept identified in ${title}.`
      })),
      formulasOrRules: []
    });
  }

  // Generate Flashcards
  const flashcards = keywords.slice(0, 6).map((k, idx) => {
    const sentenceWithKey = sentences.find(s => s.toLowerCase().includes(k.term.toLowerCase())) || `Foundational concept regarding ${k.term}.`;
    return {
      question: `What is the role and significance of **${k.term}** in this material?`,
      answer: sentenceWithKey,
      category: k.term,
      difficulty: idx % 2 === 0 ? 'medium' : 'easy'
    };
  });

  // Generate Practice Quiz Questions
  const quizQuestions = keywords.slice(0, 4).map((k, idx) => {
    const relatedSentence = sentences.find(s => s.toLowerCase().includes(k.term.toLowerCase())) || `${k.term} is an essential structural element in the system.`;
    return {
      question: `Which statement best describes the function of **${k.term}**?`,
      options: [
        relatedSentence.length > 140 ? relatedSentence.slice(0, 140) + '...' : relatedSentence,
        `It is an obsolete concept with no practical application.`,
        `It is solely used for external archival references.`,
        `It represents an unverified alternative hypothesis.`
      ],
      correctIndex: 0,
      explanation: `Based on the source text: "${relatedSentence}".`
    };
  });

  // Create clean formatted executive summary in markdown with bullet points
  const topSentences = sentences.slice(0, 4);
  const formattedSummary = topSentences.length > 0
    ? topSentences.map(s => `- ${s}`).join('\n\n')
    : `This document explores foundational concepts, frameworks, and key methodologies in **${title}**.`;

  return {
    title,
    executiveSummary: formattedSummary,
    keyTakeaways: sentences.slice(0, 5).map(s => s.length > 120 ? s.slice(0, 120) + '...' : s),
    comprehensiveSections: sections,
    glossary: keywords.map(k => ({
      term: k.term,
      definition: `Core concept highlighted within ${title}.`,
      category: 'Core Concept'
    })),
    tags,
    entities: keywords.map((k, i) => ({
      name: k.term,
      type: i % 2 === 0 ? 'Concept' : 'Topic',
      description: `Core subject matter element in ${title}`,
      relatedTo: keywords.filter(other => other.term !== k.term).slice(0, 2).map(o => o.term)
    })),
    wikilinks: keywords.map(k => `[[${k.term}]]`),
    flashcards,
    quizQuestions
  };
}
