import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as cheerio from 'cheerio';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';
import { fetchSafeUrl } from '../lib/urlSecurity';

const router = express.Router();

async function convertHtmlStringToPdf(html: string, title: string, outFilePath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const $ = cheerio.load(html);
  
  // Extract document title from HTML or fallback
  const pageTitle = $('title').text().trim() || title || 'Web Document';
  const cleanTitle = sanitizeWinAnsi(pageTitle, fontBold) || 'Web Document';

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  let y = 800;

  // Header Banner
  page.drawRectangle({
    x: 40,
    y: y - 35,
    width: 515,
    height: 45,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page.drawText(cleanTitle.slice(0, 55), {
    x: 55,
    y: y - 15,
    size: 14,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });

  page.drawText('Converted from HTML via PDFSketch Web Engine', {
    x: 55,
    y: y - 28,
    size: 8.5,
    font: fontOblique,
    color: rgb(0.45, 0.5, 0.58),
  });

  y -= 60;

  const checkPageBreak = (neededHeight: number) => {
    if (y - neededHeight < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }
  };

  // Traverse body elements
  $('body, body *').each((_, el) => {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    // Process only top-level block elements or direct text
    if (!['h1', 'h2', 'h3', 'h4', 'p', 'li', 'pre', 'blockquote', 'div', 'article', 'section', 'table'].includes(tag)) {
      return;
    }

    const directText = $(el).clone().children().remove().end().text().trim();
    const allText = $(el).text().trim();
    const textToDraw = directText || allText;

    if (!textToDraw) return;
    const sanitized = sanitizeWinAnsi(textToDraw, font);
    if (!sanitized) return;

    let fontSize = 10;
    let useFont = font;
    let textColor = rgb(0.15, 0.18, 0.22);
    let spacingAfter = 6;

    if (tag === 'h1') {
      fontSize = 18;
      useFont = fontBold;
      textColor = rgb(0.08, 0.12, 0.18);
      spacingAfter = 10;
      y -= 8;
    } else if (tag === 'h2') {
      fontSize = 14;
      useFont = fontBold;
      textColor = rgb(0.1, 0.15, 0.22);
      spacingAfter = 8;
      y -= 6;
    } else if (tag === 'h3') {
      fontSize = 12;
      useFont = fontBold;
      spacingAfter = 6;
      y -= 4;
    } else if (tag === 'blockquote') {
      useFont = fontOblique;
      textColor = rgb(0.3, 0.35, 0.42);
    }

    const words = sanitized.split(/\s+/);
    let curLine = '';
    const maxWidth = 500;
    const indent = tag === 'li' ? 65 : 45;

    if (tag === 'li') {
      curLine = '• ';
    }

    for (const w of words) {
      if (!w) continue;
      const testLine = curLine ? `${curLine} ${w}` : w;
      const wWidth = useFont.widthOfTextAtSize(testLine, fontSize);

      if (wWidth > maxWidth - (indent - 45) && curLine) {
        checkPageBreak(fontSize + 4);
        page.drawText(curLine, { x: indent, y, size: fontSize, font: useFont, color: textColor });
        y -= fontSize + 4;
        curLine = (tag === 'li' ? '  ' : '') + w;
      } else {
        curLine = testLine;
      }
    }

    if (curLine) {
      checkPageBreak(fontSize + 4);
      page.drawText(curLine, { x: indent, y, size: fontSize, font: useFont, color: textColor });
      y -= fontSize + spacingAfter;
    }
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outFilePath, pdfBytes);
}

const handleHtmlToPdf = async (req: Request, res: Response) => {
  const out = outPath('html-converted', 'pdf');
  const url = req.body.url?.trim();
  const rawHtml = req.body.html?.trim();

  try {
    let contentToConvert = '';
    let docTitle = 'webpage';

    if (req.file) {
      contentToConvert = fs.readFileSync(req.file.path, 'utf-8');
      docTitle = req.file.originalname.replace(/\.[^/.]+$/, '');
    } else if (url) {
      docTitle = url.replace(/^https?:\/\//, '').replace(/[^\w.-]/g, '_').slice(0, 30);
      try {
        const response = await fetchSafeUrl(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PDFSketch/1.0)' },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error(`Remote page returned HTTP ${response.status}`);
        contentToConvert = (await response.text()).slice(0, 5 * 1024 * 1024);
      } catch (err: any) {
        contentToConvert = `<html><head><title>${url}</title></head><body><h1>${url}</h1><p>Webpage snapshot fetched for PDF generation.</p><p>URL: <a href="${url}">${url}</a></p><p>Timestamp: ${new Date().toISOString()}</p></body></html>`;
      }
    } else if (rawHtml) {
      contentToConvert = rawHtml;
      docTitle = 'document';
    } else {
      return res.status(400).json({ error: 'Please provide a file, URL, or HTML string' });
    }

    if (!contentToConvert.includes('<html') && !contentToConvert.includes('<body')) {
      contentToConvert = `<html><body><p>${contentToConvert.replace(/\n/g, '<br/>')}</p></body></html>`;
    }

    await convertHtmlStringToPdf(contentToConvert, docTitle, out);
    if (req.file) cleanup([req.file.path]);

    sendFile(res, out, `${docTitle}.pdf`, 'application/pdf');
  } catch (e: any) {
    if (req.file) cleanup([req.file.path]);
    fail(res, e);
  }
};

router.post('/', upload.single('file'), handleHtmlToPdf);
router.post('/convert', upload.single('file'), handleHtmlToPdf);

export default router;
