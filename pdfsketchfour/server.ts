import express from 'express';
import cors from 'cors';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { optionalAuth, type AuthedRequest } from './server/lib/firebaseAdmin';
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
import redactRouter from './server/routes/redact';
import workflowRouter from './server/routes/workflow';
import htmlToPdfRouter from './server/routes/html-to-pdf';
import pdfToPdfARouter from './server/routes/pdftopdfa';
import signRouter from './server/routes/sign';
import compareRouter from './server/routes/compare';
import formsRouter from './server/routes/forms';
import translateRouter from './server/routes/translate';
import scanRouter from './server/routes/scan';
import billingRouter from './server/routes/billing';
import billingWebhookRouter from './server/routes/billingWebhook';
import { getRobotsTxt, getSitemapXml, injectSeoMetaData } from './server/seoHandler';

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);
  const app = express();

  app.set('trust proxy', 1);

  // CORS setup: allow explicitly configured origins, local development, and render deployment hosts
  const configuredOrigins = [
    ...(process.env.CORS_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean),
    ...(process.env.APP_URL ? [process.env.APP_URL.trim()] : []),
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Non-browser/server-to-server requests or same-origin requests without Origin header
      if (!origin) return callback(null, true);

      // If explicit whitelist is configured, check against it
      if (configuredOrigins.length > 0) {
        if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
          return callback(null, true);
        }
      } else {
        // Default when no custom CORS_ORIGINS is provided: allow all origins
        return callback(null, true);
      }

      // Automatically allow localhost and common platform domains (Render, Cloud Run, etc.)
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.run.app') ||
        origin.endsWith('.railway.app')
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  }));

  // Security response headers.
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_HSTS === 'true') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Stripe webhook MUST see the raw body (Stripe signs the raw bytes, not the
  // parsed JSON), so it has to be mounted before express.json() below and
  // cannot go through the generic '/api' JSON parsing at all.
  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhookRouter);

  app.use(express.json({ limit: '2mb' }));

  // Decode the Firebase ID token when present (without requiring one) so
  // the rate limiters below can key by authenticated user instead of only
  // by IP. Cheap for anonymous requests — it's a no-op when there's no
  // Authorization header.
  app.use('/api/', optionalAuth);

  // Key by signed-in user when we have one, falling back to IP otherwise.
  // Identity-aware keys close two gaps in a pure IP limiter: a logged-in
  // abuser can't reset their budget by rotating IPs/VPNs, and legitimate
  // users behind a shared IP (office NAT, campus network, mobile carrier)
  // don't all draw down the same bucket.
  const identityKeyGenerator = (req: AuthedRequest) =>
    req.uid ? `uid:${req.uid}` : `ip:${ipKeyGenerator(req.ip || '')}`;

  // Baseline rate limit for all API routes.
  app.use('/api/', rateLimit({
    windowMs: 60_000,
    max: 90,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: identityKeyGenerator,
    validate: { xForwardedForHeader: false, trustProxy: false, keyGeneratorIpFallback: false },
  }));

  // Tighter limits for expensive/abuse-prone routes, layered on top of the
  // baseline limiter above. OCR/AI-backed and billing routes are the most
  // expensive or most sensitive to abuse, so they get their own budget
  // instead of sharing the general 90 req/min allowance.
  const strictLimiter = rateLimit({
    windowMs: 60_000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: identityKeyGenerator,
    validate: { xForwardedForHeader: false, trustProxy: false, keyGeneratorIpFallback: false },
  });
  app.use('/api/scan', strictLimiter);
  app.use('/api/scantopdf', strictLimiter);
  app.use('/api/scan-pdf', strictLimiter);
  app.use('/api/translate', strictLimiter);
  app.use('/api/translate-pdf', strictLimiter);
  app.use('/api/translatepdf', strictLimiter);
  app.use('/api/billing/create-checkout-session', strictLimiter);
  app.use('/api/billing/create-portal-session', strictLimiter);

  // Prevent slow/stuck requests from holding server resources indefinitely.
  app.use('/api/', (_req, res, next) => {
    res.setTimeout(5 * 60 * 1000, () => {
      if (!res.headersSent) res.status(408).json({ error: 'Request timed out' });
    });
    next();
  });

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

  // ---------- SEO & CRAWLER ENDPOINTS ----------
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(getRobotsTxt());
  });

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').send(getSitemapXml());
  });

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
  app.use('/api/redact',        redactRouter);
  app.use('/api/redact-pdf',    redactRouter);
  app.use('/api/redactpdf',     redactRouter);
  app.use('/api/workflow',      workflowRouter);
  app.use('/api/workflows',     workflowRouter);
  app.use('/api/htmltopdf',     htmlToPdfRouter);
  app.use('/api/html-to-pdf',   htmlToPdfRouter);
  app.use('/api/pdftopdfa',     pdfToPdfARouter);
  app.use('/api/pdf-to-pdfa',   pdfToPdfARouter);
  app.use('/api/sign',          signRouter);
  app.use('/api/signpdf',       signRouter);
  app.use('/api/sign-pdf',      signRouter);
  app.use('/api/compare',       compareRouter);
  app.use('/api/compare-pdf',   compareRouter);
  app.use('/api/comparepdf',    compareRouter);
  app.use('/api/forms',         formsRouter);
  app.use('/api/pdfforms',      formsRouter);
  app.use('/api/pdf-forms',     formsRouter);
  app.use('/api/translate',     translateRouter);
  app.use('/api/translate-pdf', translateRouter);
  app.use('/api/translatepdf',  translateRouter);
  app.use('/api/scan',          scanRouter);
  app.use('/api/scantopdf',     scanRouter);
  app.use('/api/scan-pdf',      scanRouter);

  app.use('/api/billing',       billingRouter);

  // Converters
  app.use('/api', convertersRouter);

  // ---------- STATIC ASSETS ----------
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

  // ---------- VITE / STATIC SERVING ----------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/robots.txt' || req.path === '/sitemap.xml' || req.path.startsWith('/assets')) {
        return next();
      }
      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        if (!fs.existsSync(indexPath)) return next();
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const { html, isNotFound } = injectSeoMetaData(template, req.path);
        res.status(isNotFound ? 404 : 200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const { html, isNotFound } = injectSeoMetaData(rawHtml, req.path);
        res.status(isNotFound ? 404 : 200).set({ 'Content-Type': 'text/html' }).send(html);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[pdfsketch] server running on http://localhost:${PORT}`);
  });
}

startServer();
