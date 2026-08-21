import fs from 'fs';
import path from 'path';
import { Response } from 'express';

export function cleanup(files: (string | undefined | null)[]): void {
  (files || []).forEach(f => {
    if (!f) return;
    try { fs.unlinkSync(f); } catch (_) {}
  });
}

export function sendFile(res: Response, filePath: string, downloadName: string, mime?: string): void {
  const safeName = (downloadName || 'download').replace(/["\r\n]/g, '_');
  const encodedName = encodeURIComponent(downloadName || 'download');

  res.setHeader('Content-Type', mime || 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`
  );
  const stream = fs.createReadStream(filePath);
  stream.on('end', () => cleanup([filePath]));
  stream.on('error', err => {
    cleanup([filePath]);
    if (!res.headersSent) res.status(500).json({ error: 'stream failed', detail: err.message });
  });
  stream.pipe(res);
}

export function fail(res: Response, err: any): void {
  console.error('[pdfsketch]', err);
  if (!res.headersSent) {
    res.status(400).json({ error: err.message || 'failed' });
  }
}

export function outPath(prefix: string, ext: string): string {
  const tmpDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  return path.join(
    tmpDir,
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  );
}
