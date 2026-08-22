import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();
const uploadFiles = upload.array('files', 50);

router.post('/', (req: Request, res: Response) => {
  uploadFiles(req, res, async (err: any) => {
    if (err) return fail(res, err);
    
    // Support either req.files or req.file
    let files = req.files as Express.Multer.File[] | undefined;
    if ((!files || files.length === 0) && (req as any).file) {
      files = [(req as any).file];
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'at least one PDF file is required' });
    }

    const {
      workflowType, // 'custom', 'watermark-protect', 'merge-compress-numbers', 'rotate-crop-watermark'
      watermarkText,
      password,
      deg,
      cropX, cropY, cropW, cropH,
      pageNumbersPosition,
      doMerge,
      doCompress,
    } = req.body;

    const out = outPath('workflow-output', 'pdf');

    try {
      let doc: PDFDocument;

      // 1. Merge or load initial document
      const shouldMerge = doMerge === 'true' || workflowType === 'merge-compress-numbers' || files.length > 1;

      if (shouldMerge) {
        doc = await PDFDocument.create();
        for (const f of files) {
          const src = await loadPdf(fs.readFileSync(f.path), f.originalname);
          const pages = await doc.copyPages(src, src.getPageIndices());
          pages.forEach(p => doc.addPage(p));
        }
      } else {
        doc = await loadPdf(fs.readFileSync(files[0].path), files[0].originalname);
      }

      // 2. Rotate step
      const rotationAngle = parseInt(deg, 10);
      if (!isNaN(rotationAngle) && rotationAngle !== 0) {
        const pages = doc.getPages();
        pages.forEach(p => p.setRotation(degrees((p.getRotation().angle + rotationAngle) % 360)));
      }

      // 3. Crop step
      const cW = parseFloat(cropW);
      const cH = parseFloat(cropH);
      const cX = parseFloat(cropX) || 0;
      const cY = parseFloat(cropY) || 0;
      if (!isNaN(cW) && !isNaN(cH) && cW > 0 && cH > 0) {
        const pages = doc.getPages();
        pages.forEach(p => p.setCropBox(cX, cY, cW, cH));
      }

      // 4. Watermark step
      const wmText = sanitizeWinAnsi(watermarkText || (workflowType === 'watermark-protect' || workflowType === 'rotate-crop-watermark' ? 'CONFIDENTIAL' : ''));
      if (wmText) {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const pages = doc.getPages();
        pages.forEach(p => {
          const { width, height } = p.getSize();
          p.drawText(wmText, {
            x: Math.max(20, width / 4),
            y: height / 2,
            size: Math.min(36, Math.floor(width / 15)),
            font,
            color: rgb(0.6, 0.6, 0.6),
            opacity: 0.35,
            rotate: degrees(45),
          });
        });
      }

      // 5. Page numbers step
      const addNumbers = pageNumbersPosition || workflowType === 'merge-compress-numbers';
      if (addNumbers) {
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();
        const total = pages.length;
        const pos = pageNumbersPosition || 'b-c';

        pages.forEach((p, idx) => {
          const { width, height } = p.getSize();
          const label = `Page ${idx + 1} of ${total}`;
          let px = width / 2 - 25;
          let py = 20;

          if (pos === 'b-l') px = 30;
          if (pos === 'b-r') px = width - 80;
          if (pos === 't-c') py = height - 30;
          if (pos === 't-l') { px = 30; py = height - 30; }
          if (pos === 't-r') { px = width - 80; py = height - 30; }

          p.drawText(label, {
            x: Math.max(10, px),
            y: Math.max(10, py),
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
        });
      }

      // Save intermediate output
      const tempSavedPath = outPath('wf-temp', 'pdf');
      const pdfBytes = await doc.save({ useObjectStreams: true });
      fs.writeFileSync(tempSavedPath, pdfBytes);

      // 6. Protect step if password is provided
      const pwd = (password || '').trim();
      if (pwd) {
        const { runCommand } = await import('../lib/command');
        await runCommand('gs', [
          '-sDEVICE=pdfwrite', '-dEncryptionR=3', '-dKeyLength=128',
          `-sUserPassword=${pwd}`, `-sOwnerPassword=${pwd}`,
          '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${out}`, tempSavedPath,
        ], { timeout: 120_000 });
        cleanup([tempSavedPath]);
      } else {
        fs.renameSync(tempSavedPath, out);
      }

      cleanup(files.map(f => f.path));
      sendFile(res, out, 'workflow-result.pdf', 'application/pdf');

    } catch (e) {
      cleanup([...(files || []).map(f => f.path), out]);
      fail(res, e);
    }
  });
});

export default router;
