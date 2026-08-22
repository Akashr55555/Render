import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { StandardFonts, rgb, degrees } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();
const cpUpload = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

function hexToRgb(hex: string) {
  if (!hex || hex === 'transparent') return null;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return rgb(0, 0, 0);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

function parsePages(pagesStr: string, totalPages: number): number[] {
  if (!pagesStr || pagesStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const result = new Set<number>();
  const parts = pagesStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
          result.add(p - 1);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        result.add(p - 1);
      }
    }
  }
  return result.size > 0 ? Array.from(result) : Array.from({ length: totalPages }, (_, i) => i);
}

router.post('/', (req: Request, res: Response) => {
  cpUpload(req, res, async (err: any) => {
    if (err) return fail(res, err);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const pdfFile = files?.['file']?.[0];
    const imageFile = files?.['image']?.[0];

    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required for editing' });
    }

    const filesToCleanup: string[] = [pdfFile.path];
    if (imageFile) filesToCleanup.push(imageFile.path);

    try {
      const pdfBuffer = fs.readFileSync(pdfFile.path);
      const doc = await loadPdf(pdfBuffer, pdfFile.originalname);
      const pages = doc.getPages();
      const totalPages = pages.length;

      // Check if client passed structured elements JSON
      let elements: any[] = [];
      if (req.body.elements) {
        try {
          elements = typeof req.body.elements === 'string' ? JSON.parse(req.body.elements) : req.body.elements;
        } catch (_e) {
          console.warn('Failed to parse elements JSON:', _e);
        }
      }

      // Check for page rotation / deleted pages commands
      if (req.body.deletedPages) {
        try {
          const deleted: number[] = typeof req.body.deletedPages === 'string' ? JSON.parse(req.body.deletedPages) : req.body.deletedPages;
          // Sort descending to delete without index shift issues
          deleted.sort((a, b) => b - a).forEach(pIdx => {
            if (pIdx >= 0 && pIdx < doc.getPageCount()) {
              doc.removePage(pIdx);
            }
          });
        } catch (_e) {}
      }

      // Cache font objects
      const fontCache: Record<string, any> = {};
      const getFontObj = async (family: string = 'helvetica', isBold: boolean = false, isItalic: boolean = false) => {
        const fam = family.toLowerCase();
        let ref = StandardFonts.Helvetica;
        if (fam.includes('times') || fam.includes('serif')) {
          if (isBold && isItalic) ref = StandardFonts.TimesRomanBoldItalic;
          else if (isBold) ref = StandardFonts.TimesRomanBold;
          else if (isItalic) ref = StandardFonts.TimesRomanItalic;
          else ref = StandardFonts.TimesRoman;
        } else if (fam.includes('courier') || fam.includes('mono')) {
          if (isBold && isItalic) ref = StandardFonts.CourierBoldOblique;
          else if (isBold) ref = StandardFonts.CourierBold;
          else if (isItalic) ref = StandardFonts.CourierOblique;
          else ref = StandardFonts.Courier;
        } else {
          if (isBold && isItalic) ref = StandardFonts.HelveticaBoldOblique;
          else if (isBold) ref = StandardFonts.HelveticaBold;
          else if (isItalic) ref = StandardFonts.HelveticaOblique;
          else ref = StandardFonts.Helvetica;
        }
        if (!fontCache[ref]) {
          fontCache[ref] = await doc.embedFont(ref);
        }
        return fontCache[ref];
      };

      // 1. Process Structured Elements (Rich Interactive Editor)
      if (Array.isArray(elements) && elements.length > 0) {
        for (const el of elements) {
          const pageIdx = el.pageIndex !== undefined ? el.pageIndex : 0;
          if (pageIdx < 0 || pageIdx >= pages.length) continue;
          const page = pages[pageIdx];
          const { width, height } = page.getSize();

          if (el.type === 'text' && el.text) {
            const font = await getFontObj(el.fontFamily, el.bold, el.italic);
            const fontSize = parseFloat(el.fontSize || '16');
            const color = hexToRgb(el.color || '#000000') || rgb(0, 0, 0);
            const safeText = sanitizeWinAnsi(el.text, font) || el.text;

            const textWidth = font.widthOfTextAtSize(safeText, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            // Convert percentage coordinates (0-100) to page coordinates
            let x = (width * (el.xPct || 0)) / 100;
            let y = height - ((height * (el.yPct || 0)) / 100) - textHeight;

            // Optional background fill / highlight box
            if (el.bgColor && el.bgColor !== 'transparent') {
              const bgRgb = hexToRgb(el.bgColor);
              if (bgRgb) {
                page.drawRectangle({
                  x: x - 4,
                  y: y - 2,
                  width: textWidth + 8,
                  height: textHeight + 6,
                  color: bgRgb,
                  opacity: el.opacity || 0.85,
                });
              }
            }

            page.drawText(safeText, {
              x,
              y,
              size: fontSize,
              font,
              color,
            });
          } else if (el.type === 'shape') {
            const strokeColor = hexToRgb(el.strokeColor || '#3b82f6') || rgb(0.2, 0.5, 0.9);
            const fillColor = hexToRgb(el.fillColor);
            const strokeWidth = parseFloat(el.strokeWidth || '2');

            const x = (width * (el.xPct || 0)) / 100;
            const y = height - ((height * (el.yPct || 0)) / 100);
            const w = (width * (el.widthPct || 10)) / 100;
            const h = (height * (el.heightPct || 10)) / 100;

            if (el.shapeType === 'rectangle') {
              page.drawRectangle({
                x,
                y: y - h,
                width: w,
                height: h,
                borderColor: strokeColor,
                borderWidth: strokeWidth,
                color: fillColor || undefined,
                opacity: el.opacity || 1.0,
              });
            } else if (el.shapeType === 'circle') {
              page.drawEllipse({
                x: x + w / 2,
                y: y - h / 2,
                xScale: w / 2,
                yScale: h / 2,
                borderColor: strokeColor,
                borderWidth: strokeWidth,
                color: fillColor || undefined,
                opacity: el.opacity || 1.0,
              });
            } else if (el.shapeType === 'line' || el.shapeType === 'arrow') {
              page.drawLine({
                start: { x, y },
                end: { x: x + w, y: y - h },
                color: strokeColor,
                thickness: strokeWidth,
                opacity: el.opacity || 1.0,
              });
            }
          } else if (el.type === 'drawing' && Array.isArray(el.points) && el.points.length > 1) {
            const strokeColor = hexToRgb(el.strokeColor || '#ef4444') || rgb(0.9, 0.2, 0.2);
            const strokeWidth = parseFloat(el.strokeWidth || '3');
            const opacity = parseFloat(el.opacity || '1.0');

            for (let i = 0; i < el.points.length - 1; i++) {
              const p1 = el.points[i];
              const p2 = el.points[i + 1];
              const x1 = (width * p1.xPct) / 100;
              const y1 = height - ((height * p1.yPct) / 100);
              const x2 = (width * p2.xPct) / 100;
              const y2 = height - ((height * p2.yPct) / 100);

              page.drawLine({
                start: { x: x1, y: y1 },
                end: { x: x2, y: y2 },
                color: strokeColor,
                thickness: strokeWidth,
                opacity,
              });
            }
          } else if (el.type === 'image' && el.dataUrl) {
            try {
              const base64Data = el.dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
              const imgBuffer = Buffer.from(base64Data, 'base64');
              let img: any;
              if (el.dataUrl.includes('image/png')) {
                img = await doc.embedPng(imgBuffer);
              } else {
                img = await doc.embedJpg(imgBuffer);
              }

              const x = (width * (el.xPct || 0)) / 100;
              const y = height - ((height * (el.yPct || 0)) / 100);
              const w = (width * (el.widthPct || 15)) / 100;
              const h = (height * (el.heightPct || 15)) / 100;

              page.drawImage(img, {
                x,
                y: y - h,
                width: w,
                height: h,
              });
            } catch (_imgErr) {
              console.warn('Failed to embed image element:', _imgErr);
            }
          }
        }
      } else {
        // 2. Legacy / Quick Text Edit Fallback Mode
        const fontFamily = (req.body.fontFamily || 'helvetica').toLowerCase();
        const font = await getFontObj(fontFamily, req.body.bold === 'true', false);

        const text = (req.body.text || req.body.watermarkText || req.body.content || '').trim();
        const fontSize = parseFloat(req.body.fontSize || req.body.size || '16');
        const textColor = hexToRgb(req.body.color || '#000000') || rgb(0, 0, 0);
        const pos = req.body.position || 't-c';
        const targetPages = parsePages(req.body.pages || 'all', totalPages);

        let embeddedImage: any = null;
        if (imageFile) {
          const imgBuffer = fs.readFileSync(imageFile.path);
          if (imageFile.mimetype === 'image/png' || imageFile.originalname.endsWith('.png')) {
            embeddedImage = await doc.embedPng(imgBuffer);
          } else {
            embeddedImage = await doc.embedJpg(imgBuffer);
          }
        }

        for (const pageIdx of targetPages) {
          if (pageIdx < 0 || pageIdx >= totalPages) continue;
          const page = pages[pageIdx];
          const { width, height } = page.getSize();

          if (text) {
            const safeText = sanitizeWinAnsi(text, font) || text;
            const textWidth = font.widthOfTextAtSize(safeText, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            let x = (width - textWidth) / 2;
            let y = height - 50;

            if (pos === 't-l') { x = 40; y = height - 50; }
            else if (pos === 't-r') { x = width - textWidth - 40; y = height - 50; }
            else if (pos === 'c-c') { x = (width - textWidth) / 2; y = (height - textHeight) / 2; }
            else if (pos === 'b-c') { x = (width - textWidth) / 2; y = 40; }

            page.drawText(safeText, { x, y, size: fontSize, font, color: textColor });
          }

          if (embeddedImage) {
            const imgScale = parseFloat(req.body.imageScale || '0.3');
            const imgDims = embeddedImage.scale(imgScale);
            page.drawImage(embeddedImage, {
              x: (width - imgDims.width) / 2,
              y: (height - imgDims.height) / 2,
              width: imgDims.width,
              height: imgDims.height,
            });
          }
        }
      }

      const out = outPath('edited', 'pdf');
      const savedBytes = await doc.save();
      fs.writeFileSync(out, savedBytes);

      cleanup(filesToCleanup);
      sendFile(res, out, 'edited_document.pdf', 'application/pdf');
    } catch (e) {
      cleanup(filesToCleanup);
      fail(res, e);
    }
  });
});

export default router;
