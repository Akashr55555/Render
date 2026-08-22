import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();

const handleScanToPdf = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  if (files.length === 0) return res.status(400).json({ error: 'At least one scanned image is required' });

  const out = outPath('scan-document', 'pdf');
  const filterMode = req.body.filter || 'enhance'; // 'enhance' | 'bw' | 'grayscale' | 'original'

  try {
    const pdfDoc = await PDFDocument.create();

    for (const f of files) {
      let sharpPipeline = sharp(f.path);

      if (filterMode === 'bw') {
        // High contrast threshold black & white document scan
        sharpPipeline = sharpPipeline.grayscale().threshold(128);
      } else if (filterMode === 'grayscale') {
        sharpPipeline = sharpPipeline.grayscale().normalize();
      } else if (filterMode === 'enhance') {
        // Document contrast enhancement (sharpen & normalize levels)
        sharpPipeline = sharpPipeline.modulate({ brightness: 1.05, saturation: 1.1 }).sharpen();
      }

      const processedBuffer = await sharpPipeline.jpeg({ quality: 88 }).toBuffer();
      const image = await pdfDoc.embedJpg(processedBuffer);
      const { width, height } = image.scale(1);

      // Fit to A4 or retain image dimensions
      const a4Width = 595.28;
      const a4Height = 841.89;

      const scaleFactor = Math.min(a4Width / width, a4Height / height);
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;

      const page = pdfDoc.addPage([a4Width, a4Height]);
      const xPos = (a4Width - scaledWidth) / 2;
      const yPos = (a4Height - scaledHeight) / 2;

      page.drawImage(image, {
        x: xPos,
        y: yPos,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(out, pdfBytes);
    cleanup(files.map(f => f.path));

    sendFile(res, out, `scanned-document.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup(files.map(f => f.path));
    fail(res, e);
  }
};

router.post('/', upload.array('files', 20), handleScanToPdf);
router.post('/scan', upload.array('files', 20), handleScanToPdf);

export default router;
