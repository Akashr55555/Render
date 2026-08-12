import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const upload = multer({ dest: 'tmp' });

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const out = outPath('repaired', 'pdf');
  try {
    const buffer = fs.readFileSync(req.file.path);
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, parseSpeed: 1 });
    const newDoc = await PDFDocument.create();
    const pageIndices = doc.getPageIndices();
    if (pageIndices.length > 0) {
      const pages = await newDoc.copyPages(doc, pageIndices);
      pages.forEach(p => newDoc.addPage(p));
    } else {
      newDoc.addPage([600, 800]);
    }
    fs.writeFileSync(out, await newDoc.save());
    cleanup([req.file.path]);
    sendFile(res, out, 'repaired.pdf', 'application/pdf');
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
});

export default router;
