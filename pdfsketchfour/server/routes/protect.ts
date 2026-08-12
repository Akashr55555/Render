import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const execPromise = util.promisify(exec);
const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const user = (req.body.userPassword || req.body.password || '').trim();
    const owner = (req.body.ownerPassword || user).trim();
    if (!user) {
      cleanup([req.file.path]);
      return res.status(400).json({ error: 'userPassword required' });
    }
    const out = outPath('protected', 'pdf');
    try {
      const userPwdEsc = user.replace(/"/g, '\\"');
      const ownerPwdEsc = owner.replace(/"/g, '\\"');
      const inputEsc = req.file.path.replace(/"/g, '\\"');
      const outEsc = out.replace(/"/g, '\\"');

      const cmd = `gs -sDEVICE=pdfwrite -dEncryptionR=3 -dKeyLength=128 -sUserPassword="${userPwdEsc}" -sOwnerPassword="${ownerPwdEsc}" -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outEsc}" "${inputEsc}"`;
      await execPromise(cmd);

      cleanup([req.file.path]);
      sendFile(res, out, 'protected.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path, out]);
      fail(res, e);
    }
  });
});

export default router;
