import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import sharp from 'sharp';
import * as archiver from 'archiver';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import { fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    try {
      // @ts-ignore
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const data = new Uint8Array(fs.readFileSync(req.file.path));
      const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
      const dpi = Math.min(300, Math.max(72, parseInt(req.body.dpi || '150', 10)));
      const scale = dpi / 72;

      const zipPath = outPath('pdf2png', 'zip');
      const stream = fs.createWriteStream(zipPath);
      const arc = new archiver.ZipArchive({ zlib: { level: 6 } });
      stream.on('close', () => {
        if (req.file) cleanup([req.file.path]);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="pages-png.zip"');
        fs.createReadStream(zipPath).pipe(res);
      });
      arc.pipe(stream);

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d');
        await page.render({
          canvasContext: ctx as any,
          canvas: canvas as any,
          viewport,
        }).promise;
        const png = await sharp(canvas.toBuffer('image/png')).png({ compressionLevel: 9 }).toBuffer();
        arc.append(png, { name: `page-${String(i).padStart(3, '0')}.png` });
      }
      arc.finalize();
    } catch (e: any) {
      if (req.file) cleanup([req.file.path]);
      try { if (!res.headersSent) fail(res, e); } catch (_) {}
    }
  });
});

export default router;
