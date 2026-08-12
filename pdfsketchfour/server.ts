import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Express routes
import mergeRouter from './server/routes/merge';
import splitRouter from './server/routes/split';
import rotateRouter from './server/routes/rotate';
import cropRouter from './server/routes/crop';
import pageNumbersRouter from './server/routes/page-numbers';
import extractPagesRouter from './server/routes/extract-pages';
import imagesToPdfRouter from './server/routes/images-to-pdf';
import pdfToJpgRouter from './server/routes/pdf-to-jpg';
import pdfToPngRouter from './server/routes/pdf-to-png';
import watermarkRouter from './server/routes/watermark';
import protectRouter from './server/routes/protect';
import metadataRouter from './server/routes/metadata';
import compressRouter from './server/routes/compress';
import unlockRouter from './server/routes/unlock';
import repairRouter from './server/routes/repair';
import convertersRouter from './server/routes/converters';
import editRouter from './server/routes/edit';
import workflowRouter from './server/routes/workflow';

async function startServer() {
  const PORT = 3000;
  const app = express();

  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // Rate limiting for API
  app.use('/api/', rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, trustProxy: false },
  }));

  // Create tmp directory
  const tmpDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  // Cleanup tmp periodically
  setInterval(() => {
    fs.readdir(tmpDir, (err, files) => {
      if (err) return;
      const cutoff = Date.now() - 30 * 60 * 1000;
      files.forEach(f => {
        const p = path.join(tmpDir, f);
        try {
          const st = fs.statSync(p);
          if (st.mtimeMs < cutoff) fs.unlink(p, () => {});
        } catch (_) {}
      });
    });
  }, 30 * 60 * 1000);

  // ---------- API ROUTES ----------
  app.get('/api/health', (_req, res) => res.json({ ok: true, version: '1.0.0' }));

  app.use('/api/merge',         mergeRouter);
  app.use('/api/split',         splitRouter);
  app.use('/api/rotate',        rotateRouter);
  app.use('/api/crop',          cropRouter);
  
  app.use('/api/page-numbers',  pageNumbersRouter);
  app.use('/api/pagenumbers',   pageNumbersRouter);
  
  app.use('/api/extract-pages', extractPagesRouter);
  app.use('/api/organize',      extractPagesRouter);
  
  app.use('/api/images-to-pdf', imagesToPdfRouter);
  app.use('/api/jpgtopdf',      imagesToPdfRouter);
  app.use('/api/jpgpdf',        imagesToPdfRouter);
  
  app.use('/api/pdf-to-jpg',    pdfToJpgRouter);
  app.use('/api/pdftojpg',      pdfToJpgRouter);
  app.use('/api/pdfjpg',        pdfToJpgRouter);
  
  app.use('/api/pdf-to-png',    pdfToPngRouter);
  app.use('/api/pdftopng',      pdfToPngRouter);
  app.use('/api/pdfpng',        pdfToPngRouter);
  
  app.use('/api/watermark',     watermarkRouter);
  app.use('/api/protect',       protectRouter);
  app.use('/api/metadata',      metadataRouter);
  app.use('/api/compress',      compressRouter);
  app.use('/api/unlock',        unlockRouter);
  app.use('/api/repair',        repairRouter);
  app.use('/api/edit',          editRouter);
  app.use('/api/workflow',      workflowRouter);
  app.use('/api/workflows',     workflowRouter);

  // Converters
  app.use('/api', convertersRouter);

  // ---------- VITE / STATIC SERVING ----------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[pdfsketch] server running on http://localhost:${PORT}`);
  });
}

startServer();
