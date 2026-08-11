import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.array('files', 50);

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || !files.length) {
      return res.status(400).json({ error: 'at least 1 image required' });
    }
    const out = outPath('images', 'pdf');
    try {
      const doc = await PDFDocument.create();
      for (const f of files) {
        const jpg = await sharp(fs.readFileSync(f.path))
          .rotate()
          .jpeg({ quality: 90 })
          .toBuffer();
        const img = await doc.embedJpg(jpg);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      fs.writeFileSync(out, await doc.save());
      cleanup(files.map(f => f.path));
      sendFile(res, out, 'images.pdf', 'application/pdf');
    } catch (e) {
      cleanup([...(files || []).map(f => f.path), out]);
      fail(res, e);
    }
  });
});

export default router;
