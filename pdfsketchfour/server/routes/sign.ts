import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();

const handleSignPdf = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const out = outPath('signed', 'pdf');

  try {
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await loadPdf(buf, req.file.originalname);
    const docName = req.file.originalname.replace(/\.[^/.]+$/, '');
    const pages = pdfDoc.getPages();

    if (pages.length === 0) throw new Error('PDF has no pages');

    const signerName = (req.body.signerName || 'Authorized Signer').trim();
    const signatureType = req.body.signatureType || 'draw'; // 'draw' | 'type' | 'stamp'
    const signatureDataUrl = req.body.signatureDataUrl || ''; // base64 PNG
    const signerRole = req.body.signerRole || '';
    const dateStr = req.body.signDate || new Date().toISOString().split('T')[0];
    const targetPageNum = parseInt(req.body.pageNumber || `${pages.length}`, 10) - 1;
    const pageIndex = Math.min(Math.max(0, targetPageNum), pages.length - 1);
    const page = pages[pageIndex];

    const posX = parseFloat(req.body.x || '50');
    const posY = parseFloat(req.body.y || '80');
    const sigWidth = parseFloat(req.body.width || '180');
    const sigHeight = parseFloat(req.body.height || '60');

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // If base64 signature image was submitted
    if (signatureDataUrl && signatureDataUrl.startsWith('data:image/')) {
      const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const embeddedImg = signatureDataUrl.includes('image/png')
        ? await pdfDoc.embedPng(imgBuffer)
        : await pdfDoc.embedJpg(imgBuffer);

      page.drawImage(embeddedImg, {
        x: posX,
        y: posY,
        width: sigWidth,
        height: sigHeight,
      });
    } else {
      // Draw standard digital signature block
      page.drawRectangle({
        x: posX - 4,
        y: posY - 4,
        width: sigWidth + 8,
        height: sigHeight + 8,
        borderColor: rgb(0.2, 0.4, 0.8),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1),
      });

      const cleanSigner = sanitizeWinAnsi(signerName, fontBold);
      page.drawText(`Digitally Signed by: ${cleanSigner}`, {
        x: posX + 4,
        y: posY + sigHeight - 16,
        size: 10,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.5),
      });

      page.drawText(`Date: ${dateStr}`, {
        x: posX + 4,
        y: posY + sigHeight - 30,
        size: 8.5,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      if (signerRole) {
        page.drawText(`Role / Title: ${sanitizeWinAnsi(signerRole, font)}`, {
          x: posX + 4,
          y: posY + sigHeight - 42,
          size: 8,
          font: fontItalic,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      page.drawText('Verified via PDFSketch eSign', {
        x: posX + 4,
        y: posY + 4,
        size: 7,
        font: fontItalic,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(out, pdfBytes);
    cleanup([req.file.path]);

    sendFile(res, out, `${docName}-signed.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
};

router.post('/', upload.single('file'), handleSignPdf);
router.post('/sign', upload.single('file'), handleSignPdf);

export default router;
