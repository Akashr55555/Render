import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    try {
      const src = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const ranges = parseRanges(req.body.pages || '', src.getPageCount());
      const out = await PDFDocument.create();
      for (const [a, b] of ranges) {
        const idx: number[] = [];
        for (let i = a; i <= b; i++) idx.push(i);
        const copied = await out.copyPages(src, idx);
        copied.forEach(p => out.addPage(p));
      }
      const file = outPath('extracted', 'pdf');
      fs.writeFileSync(file, await out.save());
      cleanup([req.file.path]);
      sendFile(res, file, 'extracted.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

function parseRanges(str: string, total: number): [number, number][] {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean).map(p => {
    if (p.includes('-')) {
      let [a, b] = p.split('-').map(n => parseInt(n, 10));
      if (isNaN(b)) b = total;
      if (a < 1) a = 1;
      if (b > total) b = total;
      return [a - 1, b - 1] as [number, number];
    }
    const n = parseInt(p, 10);
    return [n - 1, n - 1] as [number, number];
  }).filter(([a]) => Number.isFinite(a) && a >= 0);
}

export default router;
