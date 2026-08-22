import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { loadPdf } from '../lib/loadPdf';
import { fail, cleanup } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      res.json({
        pages: doc.getPageCount(),
        title: doc.getTitle(),
        author: doc.getAuthor(),
        subject: doc.getSubject(),
        creator: doc.getCreator(),
        producer: doc.getProducer(),
        sizeBytes: req.file.size,
      });
    } catch (e) {
      fail(res, e);
    } finally {
      cleanup([req.file?.path]);
    }
  });
});

export default router;
