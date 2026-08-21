import express, { Request, Response } from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, outPath, cleanup } from '../lib/respond';

const router = express.Router();
const upload = multer({ dest: 'tmp' });
const uploadMany = upload.array('files', 50);

router.post('/', (req: Request, res: Response) => {
  uploadMany(req, res, async (err: any) => {
    if (err) return fail(res, err);
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length < 2) {
      cleanup((files || []).map(f => f.path));
      return res.status(400).json({ error: 'need at least 2 PDF files' });
    }
    const out = outPath('merged', 'pdf');
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const src = await loadPdf(fs.readFileSync(f.path), f.originalname);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      fs.writeFileSync(out, await merged.save());
      cleanup(files.map(f => f.path));
      sendFile(res, out, 'merged.pdf', 'application/pdf');
    } catch (e) {
      cleanup([...(files || []).map(f => f.path), out]);
      fail(res, e);
    }
  });
});

export default router;
