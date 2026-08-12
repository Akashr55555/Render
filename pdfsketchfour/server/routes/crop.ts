import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const { x, y, w, h } = req.body;
    const X = +x, Y = +y, W = +w, H = +h;
    if (isNaN(X) || isNaN(Y) || isNaN(W) || isNaN(H) || X < 0 || Y < 0 || W <= 0 || H <= 0) {
      cleanup([req.file.path]);
      return res.status(400).json({ error: 'x and y must be non-negative, w and h must be positive numbers' });
    }
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const targets = (req.body.pages || 'all') === 'all'
        ? doc.getPageIndices()
        : (req.body.pages || '').split(',').map((s: string) => parseInt(s, 10) - 1)
            .filter((i: number) => Number.isFinite(i) && i >= 0 && i < doc.getPageCount());
      for (const i of targets) {
        doc.getPage(i).setCropBox(X, Y, W, H);
      }
      const out = outPath('cropped', 'pdf');
      fs.writeFileSync(out, await doc.save());
      cleanup([req.file.path]);
      sendFile(res, out, 'cropped.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

export default router;
