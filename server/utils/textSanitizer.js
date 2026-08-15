/**
 * Text Sanitizer & PDF Noise Reducer
 * Strips watermarks, repetitive page headers, table of contents noise,
 * and broken line wraps to produce clean, high-density source text for AI/NLP.
 */

export function sanitizeDocumentText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Normalize line endings and unicode spaces
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove common PDF header/footer watermarks and repetitive tags like [Notes By Author]
  text = text.replace(/\[Notes\s+By\s+[^\]]+\]/gi, '');
  text = text.replace(/(?:Page\s*\d+\s*(?:of|\/)\s*\d+|\b\d+\s*\/\s*\d+\b)/gi, '');
  text = text.replace(/Downloaded\s+by\s+[^\n]+/gi, '');
  text = text.replace(/All\s+Rights\s+Reserved[^\n]*/gi, '');

  // 3. Clean Table of Contents noise (e.g. "Topic ............ 15" or "(EP 1) 6 (EP 2) 10")
  text = text.replace(/(?:\.{3,}|\_{3,}|\-{3,})\s*\d+/g, ' ');
  text = text.replace(/\(EP\s*\d+\)\s*\d+/gi, ' ');

  // 4. Split into lines and filter out empty / watermark-only lines
  const lines = text.split('\n');
  const cleanedLines = [];
  const lineFrequency = new Map();

  // Detect repeating header/footer lines that occur > 3 times
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 80) {
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines
    if (!trimmed) {
      cleanedLines.push('');
      continue;
    }
    // Skip repeating header lines (appeared more than 4 times)
    if (lineFrequency.get(trimmed) > 4) {
      continue;
    }
    // Skip standalone page number lines
    if (/^\d{1,4}$/.test(trimmed)) {
      continue;
    }
    cleanedLines.push(trimmed);
  }

  text = cleanedLines.join('\n');

  // 5. Fix broken word hyphens across lines (e.g. "algo-\nrithm" -> "algorithm")
  text = text.replace(/(\w+)-\n(\w+)/g, '$1$2');

  // 6. Fix excessive consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
