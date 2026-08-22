import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { extractPdfText } from '../lib/pdfText';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();

const handleCompare = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length < 2) {
    cleanup(files.map(f => f.path));
    return res.status(400).json({ error: 'Please upload exactly two PDF files to compare' });
  }

  const file1 = files[0];
  const file2 = files[1];
  const out = outPath('comparison-report', 'pdf');

  try {
    const textData1 = await extractPdfText(file1.path, { mimeType: file1.mimetype });
    const textData2 = await extractPdfText(file2.path, { mimeType: file2.mimetype });

    const lines1 = textData1.fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const lines2 = textData2.fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    const removedLines = lines1.filter(l => !set2.has(l));
    const addedLines = lines2.filter(l => !set1.has(l));
    const commonLines = lines1.filter(l => set2.has(l));

    const similarity = Math.round(
      (commonLines.length * 2 / (lines1.length + lines2.length || 1)) * 100
    );

    // If client requested JSON comparison results for interactive UI
    if (req.headers.accept?.includes('application/json') || req.body.format === 'json') {
      cleanup(files.map(f => f.path));
      return res.json({
        file1Name: file1.originalname,
        file2Name: file2.originalname,
        file1Pages: textData1.pages.length,
        file2Pages: textData2.pages.length,
        similarityPercentage: similarity,
        totalDiffCount: removedLines.length + addedLines.length,
        removedLines: removedLines.slice(0, 50),
        addedLines: addedLines.slice(0, 50),
        pageText1: textData1.pages,
        pageText2: textData2.pages,
      });
    }

    // Generate Comparison Summary PDF Report
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    const drawHeader = () => {
      page.drawRectangle({
        x: 40,
        y: y - 45,
        width: 515,
        height: 50,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.2, 0.4, 0.8),
        borderWidth: 1,
      });

      page.drawText('PDF Comparison Report', {
        x: 55,
        y: y - 20,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.6),
      });

      page.drawText(`Comparing: ${file1.originalname} vs ${file2.originalname}`, {
        x: 55,
        y: y - 36,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.4),
      });

      y -= 70;
    };

    drawHeader();

    // Summary Card
    page.drawRectangle({
      x: 40,
      y: y - 55,
      width: 515,
      height: 55,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    page.drawText(`Similarity Match: ${similarity}%`, {
      x: 55,
      y: y - 20,
      size: 12,
      font: fontBold,
      color: similarity > 80 ? rgb(0.1, 0.6, 0.2) : rgb(0.8, 0.4, 0.1),
    });

    page.drawText(
      `File 1: ${textData1.pages.length} Pages, ${lines1.length} Lines  |  File 2: ${textData2.pages.length} Pages, ${lines2.length} Lines`,
      { x: 55, y: y - 36, size: 9, font, color: rgb(0.3, 0.35, 0.4) }
    );

    page.drawText(
      `Identified: ${removedLines.length} deletions, ${addedLines.length} additions`,
      { x: 55, y: y - 48, size: 8.5, font, color: rgb(0.4, 0.4, 0.5) }
    );

    y -= 80;

    const checkPage = (needed: number) => {
      if (y - needed < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
    };

    // Added Content Section
    if (addedLines.length > 0) {
      checkPage(30);
      page.drawText(`+ Added in "${file2.originalname}" (${addedLines.length} lines):`, {
        x: 45,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.55, 0.2),
      });
      y -= 18;

      for (const line of addedLines.slice(0, 20)) {
        checkPage(16);
        const clean = sanitizeWinAnsi(`+ ${line.slice(0, 90)}`, font);
        page.drawText(clean, { x: 55, y, size: 8.5, font, color: rgb(0.15, 0.5, 0.2) });
        y -= 14;
      }
      y -= 10;
    }

    // Removed Content Section
    if (removedLines.length > 0) {
      checkPage(30);
      page.drawText(`- Removed / Missing from "${file2.originalname}" (${removedLines.length} lines):`, {
        x: 45,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.8, 0.15, 0.15),
      });
      y -= 18;

      for (const line of removedLines.slice(0, 20)) {
        checkPage(16);
        const clean = sanitizeWinAnsi(`- ${line.slice(0, 90)}`, font);
        page.drawText(clean, { x: 55, y, size: 8.5, font, color: rgb(0.75, 0.1, 0.1) });
        y -= 14;
      }
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(out, pdfBytes);
    cleanup(files.map(f => f.path));

    sendFile(res, out, `comparison-report.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup(files.map(f => f.path));
    fail(res, e);
  }
};

router.post('/', upload.array('files', 2), handleCompare);
router.post('/compare', upload.array('files', 2), handleCompare);

export default router;
