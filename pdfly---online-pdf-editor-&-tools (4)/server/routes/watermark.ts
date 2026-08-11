import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { StandardFonts, degrees, rgb } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const rawText = (req.body.text || '').trim();
      const text = sanitizeWinAnsi(rawText, font) || 'CONFIDENTIAL';
      const opacity = Math.min(1, Math.max(0, parseFloat(req.body.opacity || '0.2')));
      const rotate = parseFloat(req.body.rotation || '-45');
      const size = parseFloat(req.body.size) || 60;
      doc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: (width - tw) / 2,
          y: height / 2,
          size,
          font,
          opacity,
          color: rgb(0.85, 0.1, 0.2),
          rotate: degrees(rotate),
        });
      });
      const out = outPath('watermarked', 'pdf');
      fs.writeFileSync(out, await doc.save());
      cleanup([req.file.path]);
      sendFile(res, out, 'watermarked.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

export default router;
