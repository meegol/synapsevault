import * as pdfjsLib from 'pdfjs-dist';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

/**
 * Extract embedded JPEG images from raw ArrayBuffer
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Array<{id: string, name: string, dataUrl: string, sizeBytes: number}>}
 */
function extractJpegsFromArrayBuffer(arrayBuffer) {
  const images = [];
  const uint8 = new Uint8Array(arrayBuffer);
  const len = uint8.length;
  
  let i = 0;
  while (i < len - 4 && images.length < 8) {
    // Find JPEG Start of Image (FF D8 FF)
    if (uint8[i] === 0xFF && uint8[i+1] === 0xD8 && uint8[i+2] === 0xFF) {
      const startIdx = i;
      let endIdx = -1;
      
      // Look for JPEG End of Image (FF D9)
      for (let j = startIdx + 3; j < Math.min(len - 1, startIdx + 2 * 1024 * 1024); j++) {
        if (uint8[j] === 0xFF && uint8[j+1] === 0xD9) {
          endIdx = j + 2;
          break;
        }
      }
      
      if (endIdx !== -1) {
        const sizeBytes = endIdx - startIdx;
        if (sizeBytes > 3000 && sizeBytes < 1500000) { // Skip tiny icons and giant raw scans
          const chunk = uint8.subarray(startIdx, endIdx);
          let binary = '';
          const chunkLen = chunk.byteLength;
          for (let k = 0; k < chunkLen; k++) {
            binary += String.fromCharCode(chunk[k]);
          }
          const base64 = btoa(binary);
          const imgIndex = images.length + 1;
          
          images.push({
            id: `fig-${imgIndex}`,
            figureNumber: imgIndex,
            name: `Figure ${imgIndex}`,
            caption: '',
            dataUrl: `data:image/jpeg;base64,${base64}`,
            sizeBytes
          });
        }
        i = endIdx;
        continue;
      }
    }
    i++;
  }
  
  return images;
}

/**
 * Extract figure captions from raw text
 * @param {string} text 
 * @returns {Map<number, string>}
 */
function extractFigureCaptionsFromText(text) {
  const captionMap = new Map();
  const figureRegex = /(?:Figure|Fig\.?|Diagram)\s*(\d+)[\s.:\-—]+([^\n\r]{8,140})/gi;
  let match;
  
  while ((match = figureRegex.exec(text)) !== null) {
    const figNum = parseInt(match[1], 10);
    const captionRaw = match[2].trim().replace(/[.;,]+$/, '');
    if (figNum > 0 && captionRaw && !captionMap.has(figNum)) {
      captionMap.set(figNum, captionRaw);
    }
  }

  return captionMap;
}

/**
 * Parse PDF in browser using PDF.js with smart figure caption matching
 * @param {File} file 
 * @param {(progress: { current: number, total: number }) => void} [onProgress]
 * @returns {Promise<{title: string, rawText: string, numPages: number, wordCount: number, images: Array<Object>}>}
 */
export async function parsePdfInBrowser(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract images directly from binary
  let images = [];
  try {
    images = extractJpegsFromArrayBuffer(arrayBuffer);
  } catch (err) {
    console.warn('Image extraction notice:', err);
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const textPieces = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({ current: pageNum, total: numPages });
    }

    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    
    let lastY = null;
    let pageText = '';
    
    for (const item of content.items) {
      if (lastY === null || Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n' + item.str;
      } else {
        pageText += ' ' + item.str;
      }
      lastY = item.transform[5];
    }

    textPieces.push(pageText.trim());
  }

  const rawText = textPieces.filter(Boolean).join('\n\n');
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

  // Match captions to figures
  const captionMap = extractFigureCaptionsFromText(rawText);
  images.forEach((img, idx) => {
    const figNum = idx + 1;
    if (captionMap.has(figNum)) {
      const cap = captionMap.get(figNum);
      img.name = `Fig. ${figNum}: ${cap.length > 45 ? cap.slice(0, 45) + '…' : cap}`;
      img.caption = `Figure ${figNum}: ${cap}`;
    } else {
      img.name = `Figure ${figNum} (${cleanTitle})`;
      img.caption = `Extracted diagram ${figNum} from ${cleanTitle}`;
    }
  });

  return {
    title: cleanTitle,
    rawText,
    numPages,
    wordCount,
    images
  };
}
