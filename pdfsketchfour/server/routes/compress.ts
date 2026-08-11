import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const execPromise = util.promisify(exec);
const router = express.Router();
const upload = multer({ dest: 'tmp' });
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const level = (req.body.level || 'medium').toLowerCase();
    const out = outPath('compressed', 'pdf');

    try {
      let gsSetting = '/ebook';
      if (level === 'high' || level === 'extreme' || level === 'max') {
        gsSetting = '/screen';
      } else if (level === 'low') {
        gsSetting = '/printer';
      }

      const inputEsc = req.file.path.replace(/"/g, '\\"');
      const outEsc = out.replace(/"/g, '\\"');

      // Use PDF 1.7 compatibility level, preserve colors & embed fonts to prevent blank pages
      const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.7 -dPDFSETTINGS=${gsSetting} -dEmbedAllFonts=true -dSubsetFonts=true -dColorConversionStrategy=/LeaveColorUnchanged -dAutoRotatePages=/None -dDOINTERPOLATE -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outEsc}" "${inputEsc}"`;

      let success = false;
      try {
        await execPromise(cmd);
        if (fs.existsSync(out) && fs.statSync(out).size > 500) {
          // Verify that output file is valid and readable
          const testBuf = fs.readFileSync(out);
          const doc = await loadPdf(testBuf, 'compressed.pdf');
          if (doc.getPageCount() > 0) {
            success = true;
          }
        }
      } catch (_gsErr) {
        console.warn('Ghostscript compression warning, using pdf-lib stream compression fallback:', _gsErr);
      }

      // Fallback to pdf-lib stream saving if Ghostscript produced empty/invalid file
      if (!success) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const doc = await loadPdf(fileBuffer, req.file.originalname);
        const savedBytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
        fs.writeFileSync(out, savedBytes);
      }

      cleanup([req.file.path]);
      sendFile(res, out, 'compressed.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path, out]);
      fail(res, e);
    }
  });
});

export default router;

