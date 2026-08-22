import { PDFDocument } from 'pdf-lib';

export async function loadPdf(buffer: Buffer, label: string = 'input.pdf'): Promise<PDFDocument> {
  if (!buffer || !buffer.length) throw new Error(`empty file: ${label}`);
  if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error(`${label} is not a valid PDF file`);
  }
  try {
    return await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch (e: any) {
    if (/encrypted/i.test(e.message)) {
      throw new Error(
        `${label} is password-protected — pre-decrypt with Unlock or use pdf-lib-friendly PDF`
      );
    }
    throw new Error(`cannot parse ${label}: ${e.message}`);
  }
}
