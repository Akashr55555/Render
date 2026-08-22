import express, { Request, Response } from 'express';
import { secureUpload as upload, validatePdfUpload } from '../lib/upload';
import fs from 'fs';
import { runCommand } from '../lib/command';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();
const up = upload.single('file');

router.post('/', (req: Request, res: Response) => {
  up(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'file required' });
  try { validatePdfUpload(req.file); } catch (e: any) { cleanup([req.file.path]); return res.status(400).json({ error: e.message }); }
    const level = (req.body.level || 'medium').toLowerCase();
    const out = outPath('compressed', 'pdf');

    try {
      let gsSetting = '/ebook';
      if (level === 'high' || level === 'extreme' || level === 'max') {
        gsSetting = '/screen';
      } else if (level === 'low') {
        gsSetting = '/printer';
      }

      let success = false;
      try {
        await runCommand('gs', [
          '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.7', `-dPDFSETTINGS=${gsSetting}`,
          '-dEmbedAllFonts=true', '-dSubsetFonts=true', '-dColorConversionStrategy=/LeaveColorUnchanged',
          '-dAutoRotatePages=/None', '-dDOINTERPOLATE', '-dNOPAUSE', '-dQUIET', '-dBATCH',
          `-sOutputFile=${out}`, req.file.path,
        ], { timeout: 120_000 });
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

