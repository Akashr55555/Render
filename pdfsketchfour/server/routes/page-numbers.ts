import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { StandardFonts, rgb } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const size = parseFloat(req.body.size) || 11;
      const start = parseInt(req.body.start || '1', 10);
      const color = parseColor(req.body.color || '#1f2937');
      doc.getPages().forEach((page, idx) => {
        const label = String(start + idx);
        const { width: w, height: h } = page.getSize();
        const tw = font.widthOfTextAtSize(label, size);
        const m = 24;
        let x: number, y: number;
        const pos = (req.body.position || 'b-c');
        if (pos.startsWith('t')) y = h - m;
        else y = m;
        if (pos.endsWith('l')) x = m;
        else if (pos.endsWith('r')) x = w - tw - m;
        else x = (w - tw) / 2;
        page.drawText(label, { x, y, size, font, color });
      });
      const out = outPath('numbered', 'pdf');
      fs.writeFileSync(out, await doc.save());
      cleanup([req.file.path]);
      sendFile(res, out, 'numbered.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

function parseColor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return rgb(0.12, 0.16, 0.22);
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export default router;
