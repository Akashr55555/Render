import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { degrees } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const deg = parseInt(req.body.deg || '90', 10);
    if (![90, 180, 270].includes(deg)) {
      cleanup([req.file.path]);
      return res.status(400).json({ error: 'deg must be 90, 180, or 270' });
    }
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const indices = (req.body.pages || 'all') === 'all'
        ? doc.getPageIndices()
        : parsePageList(req.body.pages, doc.getPageCount());
      for (const i of indices) {
        const page = doc.getPage(i);
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + deg) % 360));
      }
      const out = outPath('rotated', 'pdf');
      fs.writeFileSync(out, await doc.save());
      cleanup([req.file.path]);
      sendFile(res, out, 'rotated.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

function parsePageList(str: string, total: number): number[] {
  if (!str) return [];
  return str.split(',').flatMap(p => {
    p = p.trim();
    if (!p) return [];
    if (p.includes('-')) {
      let [a, b] = p.split('-').map(n => parseInt(n, 10));
      if (isNaN(b)) b = total;
      return Array.from({ length: b - a + 1 }, (_, k) => a - 1 + k).filter(i => i >= 0 && i < total);
    }
    const n = parseInt(p, 10);
    return Number.isFinite(n) && n >= 1 && n <= total ? [n - 1] : [];
  });
}

export default router;
