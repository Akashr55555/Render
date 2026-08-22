import fs from 'fs';
import path from 'path';
import { runCommand } from './command';
import Tesseract from 'tesseract.js';


export interface ExtractionResult {
  pages: string[];
  fullText: string;
  isOcrUsed: boolean;
}

export async function extractPdfText(
  filePath: string,
  options: { forceOcr?: boolean; mimeType?: string } = {}
): Promise<ExtractionResult> {
  const isImage =
    options.mimeType?.startsWith('image/') ||
    /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(filePath);

  // If input is an image directly, run Tesseract OCR directly
  if (isImage) {
    try {
      const res = await Tesseract.recognize(filePath, 'eng');
      const text = res.data.text.trim();
      return {
        pages: [text || '(No text detected in image)'],
        fullText: text || '(No text detected in image)',
        isOcrUsed: true,
      };
    } catch (err) {
      console.error('OCR Error on image:', err);
      return {
        pages: ['(Unable to perform OCR on image)'],
        fullText: '(Unable to perform OCR on image)',
        isOcrUsed: true,
      };
    }
  }

  // First try standard PDF text extraction via pdfjs
  let pdfjsPages: string[] = [];
  let pdfjsFullText = '';

  if (!options.forceOcr) {
    try {
      // @ts-ignore
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const data = new Uint8Array(fs.readFileSync(filePath));
      const loadingTask = pdfjs.getDocument({ data, disableFontFace: true });
      const pdfDoc = await loadingTask.promise;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        pdfjsPages.push(pageText.trim());
      }

      pdfjsFullText = pdfjsPages.join('\n\n').trim();
    } catch (err) {
      console.warn('Standard PDF text extraction failed or had issues:', err);
    }
  }

  // Check if standard extraction yielded sufficient readable text
  const isSufficientText =
    pdfjsFullText.length > 20 &&
    pdfjsFullText.length / Math.max(1, pdfjsPages.length) > 10;

  if (isSufficientText && !options.forceOcr) {
    return {
      pages: pdfjsPages,
      fullText: pdfjsFullText,
      isOcrUsed: false,
    };
  }

  // If standard extraction gave empty or sparse text (scanned PDF), fallback to Ghostscript + Tesseract OCR
  console.log(
    `[PDF Text Extraction] Scanned document or sparse text detected (${pdfjsFullText.length} chars). Applying OCR...`
  );

  const tmpPrefix = path.join(
    'tmp',
    `ocr_page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  );
  const pngPattern = `${tmpPrefix}_%d.png`;

  const ocrPages: string[] = [];

  try {
    // Render PDF pages to PNG images using Ghostscript
    await runCommand('gs', ['-dNOPAUSE', '-dBATCH', '-sDEVICE=png16m', '-r150', `-sOutputFile=${pngPattern}`, filePath], { timeout: 180_000 });

    // Find generated page PNGs
    const tmpDir = path.dirname(tmpPrefix);
    const prefixName = path.basename(tmpPrefix);
    const pageFiles = fs.readdirSync(tmpDir)
      .filter(f => f.startsWith(prefixName) && f.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(`${prefixName}_`, '').replace('.png', ''), 10);
        const numB = parseInt(b.replace(`${prefixName}_`, '').replace('.png', ''), 10);
        return numA - numB;
      });

    for (const file of pageFiles) {
      const pagePath = path.join(tmpDir, file);
      try {
        const res = await Tesseract.recognize(pagePath, 'eng');
        const text = res.data.text.trim();
        ocrPages.push(text || '(No text detected on page)');
      } catch (ocrErr) {
        console.error(`OCR failed for page ${file}:`, ocrErr);
        ocrPages.push('(OCR extraction failed for page)');
      } finally {
        try {
          fs.unlinkSync(pagePath);
        } catch (_) {}
      }
    }

    const ocrFullText = ocrPages.join('\n\n').trim();

    if (ocrFullText.length > 0) {
      return {
        pages: ocrPages,
        fullText: ocrFullText,
        isOcrUsed: true,
      };
    }
  } catch (ocrProcessErr) {
    console.error('OCR Pipeline Error:', ocrProcessErr);
  }

  // Fallback to pdfjs text if OCR pipeline produced nothing better
  return {
    pages: pdfjsPages.length > 0 ? pdfjsPages : ['(Unable to extract text from document)'],
    fullText: pdfjsFullText.length > 0 ? pdfjsFullText : '(Unable to extract text from document)',
    isOcrUsed: false,
  };
}


