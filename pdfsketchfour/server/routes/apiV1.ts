import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';
import { runCommand } from '../lib/command';

const router = express.Router();
const uploadFiles = upload.array('files', 20);
const uploadSingle = upload.single('file');

/**
 * OpenAPI 3.0 Documentation Specification Endpoint
 */
router.get('/docs', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'PDFSketch Platform Public API',
      version: '1.0.0',
      description: 'Programmatic REST API for automated document processing, conversion, manipulation, and workflow execution.',
      contact: {
        name: 'PDFSketch Platform API Support',
        url: 'https://pdfsketch.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current Environment API Server',
      },
    ],
    paths: {
      '/merge': {
        post: {
          summary: 'Merge multiple PDF documents',
          description: 'Upload two or more PDF files to combine them sequentially into a single PDF.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    files: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' },
                      description: 'PDF files to merge in the preferred sequence',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Merged PDF binary stream', content: { 'application/pdf': {} } },
            400: { description: 'Invalid input parameters or empty file set' },
          },
        },
      },
      '/compress': {
        post: {
          summary: 'Compress and optimize PDF document',
          description: 'Reduce file size while preserving layout resolution.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    level: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Compressed PDF binary stream', content: { 'application/pdf': {} } },
          },
        },
      },
      '/watermark': {
        post: {
          summary: 'Apply text watermark stamp',
          description: 'Stamp custom text across all document pages.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    text: { type: 'string', default: 'CONFIDENTIAL' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Watermarked PDF binary stream', content: { 'application/pdf': {} } },
          },
        },
      },
      '/workflow': {
        post: {
          summary: 'Execute custom multi-action PDF pipeline',
          description: 'Run chained transformations (merge, rotate, watermark, page-numbers, protect) in a single request.',
          responses: {
            200: { description: 'Processed PDF binary stream', content: { 'application/pdf': {} } },
          },
        },
      },
    },
  });
});

/**
 * Health & API status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    capabilities: [
      'merge',
      'split',
      'compress',
      'rotate',
      'watermark',
      'protect',
      'unlock',
      'page-numbers',
      'crop',
      'convert',
      'workflow',
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * Merge API endpoint
 */
router.post('/merge', (req: Request, res: Response) => {
  uploadFiles(req, res, async (err: any) => {
    if (err) return fail(res, err);
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'At least two PDF files are required for merging' });
    }

    const out = outPath('api-merge', 'pdf');
    try {
      const mergedDoc = await PDFDocument.create();
      for (const f of files) {
        const src = await loadPdf(fs.readFileSync(f.path), f.originalname);
        const pages = await mergedDoc.copyPages(src, src.getPageIndices());
        pages.forEach(p => mergedDoc.addPage(p));
      }
      const pdfBytes = await mergedDoc.save({ useObjectStreams: true });
      fs.writeFileSync(out, pdfBytes);
      cleanup(files.map(f => f.path));
      sendFile(res, out, 'merged-document.pdf', 'application/pdf');
    } catch (e) {
      cleanup([...files.map(f => f.path), out]);
      fail(res, e);
    }
  });
});

/**
 * Compress API endpoint
 */
router.post('/compress', (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const level = (req.body.level || 'medium').toLowerCase();
    const pdfSettings = level === 'high' ? '/screen' : level === 'low' ? '/printer' : '/ebook';
    const out = outPath('api-compress', 'pdf');

    try {
      await runCommand('gs', [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${pdfSettings}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${out}`,
        req.file.path,
      ], { timeout: 120_000 });

      cleanup([req.file.path]);
      sendFile(res, out, 'compressed-document.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path, out]);
      fail(res, e);
    }
  });
});

/**
 * Watermark API endpoint
 */
router.post('/watermark', (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) return fail(res, err);
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const rawText = req.body.text || 'CONFIDENTIAL';
    const text = sanitizeWinAnsi(rawText);
    const out = outPath('api-watermark', 'pdf');

    try {
      const doc = await loadPdf(fs.readFileSync(req.file.path), req.file.originalname);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.drawText(text, {
          x: Math.max(20, width / 4),
          y: height / 2,
          size: Math.min(36, Math.floor(width / 15)),
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.35,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await doc.save({ useObjectStreams: true });
      fs.writeFileSync(out, pdfBytes);
      cleanup([req.file.path]);
      sendFile(res, out, 'watermarked-document.pdf', 'application/pdf');
    } catch (e) {
      cleanup([req.file.path, out]);
      fail(res, e);
    }
  });
});

export default router;
