import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import * as archiver from 'archiver';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const mode = req.body.mode || 'single';
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const total = doc.getPageCount();
      const slices = computeSlices(mode, req.body, total);
      if (!slices.length) {
        cleanup([req.file.path]);
        return res.status(400).json({ error: 'no valid pages' });
      }
      const zipPath = outPath('split', 'zip');
      const out = fs.createWriteStream(zipPath);
      const arc = new archiver.ZipArchive({ zlib: { level: 6 } });
      out.on('close', () => {
        cleanup([req.file?.path]);
        sendFile(res, zipPath, 'split.zip', 'application/zip');
      });
      arc.pipe(out);
      for (const [i, range] of slices.entries()) {
        const part = await PDFDocument.create();
        const copied = await part.copyPages(doc, range);
        copied.forEach(p => part.addPage(p));
        arc.append(Buffer.from(await part.save()), {
          name: `part-${String(i + 1).padStart(3, '0')}.pdf`,
        });
      }
      arc.finalize();
    } catch (e) {
      cleanup([req.file.path]);
      fail(res, e);
    }
  });
});

function computeSlices(mode: string, body: any, total: number): number[][] {
  if (mode === 'single') {
    return Array.from({ length: total }, (_, i) => [i]);
  }
  if (mode === 'every') {
    const n = Math.max(1, parseInt(body.everyN || '1', 10));
    const out: number[][] = [];
    for (let i = 0; i < total; i += n) {
      const range: number[] = [];
      for (let j = i; j < Math.min(i + n, total); j++) range.push(j);
      out.push(range);
    }
    return out;
  }
  if (mode === 'ranges') {
    const ranges = parseRanges(body.ranges || '', total);
    return ranges.map(([a, b]) => Array.from({ length: b - a + 1 }, (_, k) => a + k));
  }
  return [];
}

function parseRanges(str: string, total: number): [number, number][] {
  return (str || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => {
      if (part.includes('-')) {
        let [a, b] = part.split('-').map(n => parseInt(n, 10));
        if (isNaN(b)) b = total;
        if (a < 1) a = 1;
        if (b > total) b = total;
        return [a - 1, b - 1] as [number, number];
      }
      const n = parseInt(part, 10);
      return [n - 1, n - 1] as [number, number];
    })
    .filter(([a, b]) => !isNaN(a) && a >= 0 && b >= a);
}

export default router;
