import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import type { Request } from 'express';

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 50;
export const MAX_REQUEST_FILES_SIZE = 250 * 1024 * 1024;

const TMP_DIR = path.join(process.cwd(), 'tmp');
fs.mkdirSync(TMP_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff',
  '.txt', '.csv', '.md', '.html', '.htm'
]);

const BLOCKED_MIMES = new Set([
  'application/x-msdownload',
  'application/x-sh',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-httpd-php',
  'text/x-shellscript'
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => cb(null, `upload-${Date.now()}-${crypto.randomBytes(10).toString('hex')}`),
});

export const secureUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
    fields: 80,
    fieldSize: 256 * 1024,
  },
  fileFilter: (_req: Request, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || BLOCKED_MIMES.has(file.mimetype)) {
      return cb(new Error('Unsupported or unsafe file type'));
    }
    cb(null, true);
  },
});

export function isPdfSignature(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(5);
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    return buf.toString('ascii') === '%PDF-';
  } catch {
    return false;
  }
}

export function validatePdfUpload(file: Express.Multer.File | undefined): void {
  if (!file) throw new Error('file required');
  if (!isPdfSignature(file.path)) throw new Error('The uploaded file is not a valid PDF');
}
