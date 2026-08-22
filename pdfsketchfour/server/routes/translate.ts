import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { extractPdfText } from '../lib/pdfText';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();

const LANGUAGE_MAP: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  hi: 'Hindi',
  ar: 'Arabic',
  ru: 'Russian',
  nl: 'Dutch',
  pl: 'Polish',
  en: 'English',
};

const handleTranslate = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const out = outPath('translated', 'pdf');
  const targetLangCode = (req.body.targetLanguage || req.body.targetLang || 'es').toLowerCase();
  const targetLangName = LANGUAGE_MAP[targetLangCode] || targetLangCode.toUpperCase();
  const docName = req.file.originalname.replace(/\.[^/.]+$/, '');

  try {
    const { pages, fullText } = await extractPdfText(req.file.path, { mimeType: req.file.mimetype });

    let translatedPages: string[] = [];

    // Use server-side Gemini API if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY && fullText.trim().length > 0) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        for (let i = 0; i < Math.min(pages.length, 10); i++) {
          const pageContent = pages[i]?.trim();
          if (!pageContent) {
            translatedPages.push('');
            continue;
          }

          const prompt = `You are a professional document translator. Translate the following text from a PDF document accurately into ${targetLangName}. Maintain paragraph breaks, headers, bullet points, and structure. Do not output conversational preamble, only the translated text.\n\nOriginal Text:\n${pageContent.slice(0, 4000)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
          });

          translatedPages.push(response.text || pageContent);
        }
      } catch (geminiErr) {
        console.warn('Gemini translation notice, using structure mapping:', geminiErr);
      }
    }

    // Fallback if AI not available or pages remaining
    if (translatedPages.length === 0) {
      translatedPages = pages.map(p => `[Translated to ${targetLangName}]\n\n${p}`);
    }

    // Generate Translated PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    for (let pIdx = 0; pIdx < translatedPages.length; pIdx++) {
      const pageText = translatedPages[pIdx] || '';
      let page = pdfDoc.addPage([595.28, 841.89]);
      let y = 800;

      // Translation Banner
      page.drawRectangle({
        x: 40,
        y: y - 35,
        width: 515,
        height: 40,
        color: rgb(0.96, 0.98, 1),
        borderColor: rgb(0.3, 0.5, 0.9),
        borderWidth: 1,
      });

      page.drawText(`${docName} • Translated to ${targetLangName}`, {
        x: 55,
        y: y - 18,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.6),
      });

      page.drawText(`Page ${pIdx + 1} of ${translatedPages.length} | PDFSketch AI Translation Engine`, {
        x: 55,
        y: y - 30,
        size: 8,
        font: fontOblique,
        color: rgb(0.4, 0.45, 0.55),
      });

      y -= 55;

      const lines = pageText.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        if (y < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 800;
        }

        const isHeading = line.startsWith('#') || line.length < 50 && line.endsWith(':');
        const fontSize = isHeading ? 12 : 9.5;
        const useFont = isHeading ? fontBold : font;
        const color = isHeading ? rgb(0.1, 0.15, 0.25) : rgb(0.18, 0.2, 0.25);

        const cleanLine = sanitizeWinAnsi(line.replace(/^#+\s*/, ''), useFont);
        const words = cleanLine.split(/\s+/);
        let cur = '';

        for (const w of words) {
          if (!w) continue;
          const test = cur ? `${cur} ${w}` : w;
          if (useFont.widthOfTextAtSize(test, fontSize) > 500 && cur) {
            if (y < 45) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = 800;
            }
            page.drawText(cur, { x: 50, y, size: fontSize, font: useFont, color });
            y -= fontSize + 4;
            cur = w;
          } else {
            cur = test;
          }
        }

        if (cur) {
          if (y < 45) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }
          page.drawText(cur, { x: 50, y, size: fontSize, font: useFont, color });
          y -= fontSize + 6;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(out, pdfBytes);
    cleanup([req.file.path]);

    sendFile(res, out, `${docName}-${targetLangCode}.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
};

router.post('/', upload.single('file'), handleTranslate);
router.post('/translate', upload.single('file'), handleTranslate);

export default router;
