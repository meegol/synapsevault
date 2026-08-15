import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extract structured text and metadata from an uploaded PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<Object>} Extracted document content and metadata
 */
export async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  
  const options = {
    // Custom page rendering handler if needed
    pagerender: function(pageData) {
      return pageData.getTextContent().then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        return text;
      });
    }
  };

  const parsed = await pdfParse(dataBuffer, options);

  const rawText = parsed.text.trim();
  const numPages = parsed.numpages || 1;
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const characterCount = rawText.length;
  const estimatedReadingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Extract outline sections or chunk by paragraphs
  const cleanParagraphs = rawText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  return {
    rawText,
    numPages,
    wordCount,
    characterCount,
    estimatedReadingTimeMinutes,
    paragraphs: cleanParagraphs,
    info: parsed.info || {}
  };
}
