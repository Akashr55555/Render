import express, { Request, Response } from 'express';
import { secureUpload as upload, validatePdfUpload } from '../lib/upload';
import fs from 'fs';
import { runCommand } from '../lib/command';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
  try { validatePdfUpload(req.file); } catch (e: any) { cleanup([req.file.path]); return res.status(400).json({ error: e.message }); }
    const user = (req.body.userPassword || req.body.password || '').trim();
    const owner = (req.body.ownerPassword || user).trim();
    if (!user) {
      cleanup([req.file.path]);
      return res.status(400).json({ error: 'userPassword required' });
    }
    const out = outPath('protected', 'pdf');
    try {
      await runCommand('gs', [
        '-sDEVICE=pdfwrite', '-dEncryptionR=3', '-dKeyLength=128',
        `-sUserPassword=${user}`, `-sOwnerPassword=${owner}`,
        '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${out}`, req.file.path,
      ], { timeout: 120_000 });

      cleanup([req.file.path]);
      sendFile(res, out, 'protected.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path, out]);
      fail(res, e);
    }
  });
});

export default router;
