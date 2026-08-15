import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extract embedded JPEG images from raw PDF buffer
 * @param {Buffer} buffer 
 * @returns {Array<{id: string, name: string, dataUrl: string, sizeBytes: number}>}
 */
function extractEmbeddedImages(buffer) {
  const images = [];
  let startIdx = 0;
  
  // Look for JPEG markers (FF D8 FF ... FF D9)
  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]);
  const jpegFooter = Buffer.from([0xFF, 0xD9]);

  while ((startIdx = buffer.indexOf(jpegHeader, startIdx)) !== -1 && images.length < 20) {
    const endIdx = buffer.indexOf(jpegFooter, startIdx + 3);
    if (endIdx === -1) break;
    
    const length = (endIdx + 2) - startIdx;
    
    // Only capture figures larger than 2KB to filter out tiny bullet points and artifacts
    if (length > 2048 && length < 10 * 1024 * 1024) {
      const imgBuffer = buffer.subarray(startIdx, endIdx + 2);
      const imgIndex = images.length + 1;
      
      images.push({
        id: `fig-${imgIndex}`,
        name: `Figure ${imgIndex}`,
        dataUrl: `data:image/jpeg;base64,${imgBuffer.toString('base64')}`,
        sizeBytes: length
      });
    }
    
    startIdx = endIdx + 2;
  }

  return images;
}

/**
 * Extract structured text, metadata, and embedded images from an uploaded PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<Object>} Extracted document content, metadata, and images
 */
export async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  
  const options = {
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

  // Extract embedded diagram images
  const images = extractEmbeddedImages(dataBuffer);

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
    images,
    info: parsed.info || {}
  };
}
