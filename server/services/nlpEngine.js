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
 * Generate a comprehensive fallback reviewer without an LLM
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.sourceType
 * @param {string} params.content
 * @returns {Object}
 */
export function generateHeuristicReviewer({ title, sourceType, content }) {
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  const keywords = extractKeywords(content, 10);
  const tags = keywords.slice(0, 5).map(k => k.term.toLowerCase().replace(/\s+/g, '-'));

  // Split into chunks for sections
  const chunkSize = Math.max(3, Math.ceil(sentences.length / 4));
  const sections = [];

  for (let i = 0; i < sentences.length; i += chunkSize) {
    const chunkSentences = sentences.slice(i, i + chunkSize);
    const chunkText = chunkSentences.join(' ');
    const chunkKeywords = extractKeywords(chunkText, 4);

    const sectionTitle = chunkKeywords[0] ? `Part ${sections.length + 1}: ${chunkKeywords[0].term} & Concepts` : `Section ${sections.length + 1}`;
    
    sections.push({
      sectionTitle,
      detailedNotesMarkdown: chunkSentences.map(s => `- ${s}`).join('\n\n'),
      keyTerms: chunkKeywords.map(k => ({
        term: k.term,
        definition: `Crucial concept identified in ${title} associated with key discussions.`
      })),
      formulasOrRules: []
    });
  }

  // Generate Flashcards
  const flashcards = keywords.slice(0, 6).map((k, idx) => {
    const sentenceWithKey = sentences.find(s => s.toLowerCase().includes(k.term.toLowerCase())) || `Discussion centered around ${k.term}.`;
    return {
      question: `What is the significance of "${k.term}" in this context?`,
      answer: sentenceWithKey,
      category: k.term,
      difficulty: idx % 2 === 0 ? 'medium' : 'easy'
    };
  });

  // Generate Practice Quiz Questions
  const quizQuestions = keywords.slice(0, 4).map((k, idx) => {
    const relatedSentence = sentences.find(s => s.toLowerCase().includes(k.term.toLowerCase())) || `${k.term} represents a core pillar discussed in the material.`;
    return {
      question: `Which of the following statements accurately characterizes "${k.term}" based on the document?`,
      options: [
        relatedSentence.slice(0, 120) + '...',
        `It is completely unrelated to the primary objectives of the study.`,
        `It was superseded and deprecated in earlier iterations of the architecture.`,
        `It functions solely as an auxiliary data placeholder.`
      ],
      correctIndex: 0,
      explanation: `According to the source material: "${relatedSentence}".`
    };
  });

  return {
    title,
    executiveSummary: sentences.slice(0, 3).join(' ') || `${title} provides in-depth exploration and foundational analysis.`,
    keyTakeaways: sentences.slice(0, 5),
    comprehensiveSections: sections,
    glossary: keywords.map(k => ({
      term: k.term,
      definition: `Key concept highlighted within ${title}.`,
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
