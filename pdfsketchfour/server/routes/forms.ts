import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, rgb, StandardFonts } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';
import { sanitizeWinAnsi } from '../lib/winAnsi';

const router = express.Router();

// 1. Detect form fields & Inspect
router.post('/inspect', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  try {
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await loadPdf(buf, req.file.originalname);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const fieldData = fields.map(f => {
      const name = f.getName();
      let type = 'unknown';
      let value: any = '';

      if (f instanceof PDFTextField) {
        type = 'text';
        value = f.getText() || '';
      } else if (f instanceof PDFCheckBox) {
        type = 'checkbox';
        value = f.isChecked();
      } else if (f instanceof PDFDropdown) {
        type = 'dropdown';
        value = f.getSelected() || [];
      } else if (f instanceof PDFRadioGroup) {
        type = 'radio';
        value = f.getSelected() || '';
      }

      return { name, type, value };
    });

    cleanup([req.file.path]);
    res.json({
      fileName: req.file.originalname,
      hasForm: fields.length > 0,
      fieldCount: fields.length,
      fields: fieldData,
    });
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
});

// 2. Fill or Create form fields & Generate PDF
const handleFillOrCreateForm = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const out = outPath('form-processed', 'pdf');

  try {
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await loadPdf(buf, req.file.originalname);
    const docName = req.file.originalname.replace(/\.[^/.]+$/, '');
    const form = pdfDoc.getForm();

    // Parse submitted field values
    let fieldValues: Record<string, string | boolean> = {};
    if (req.body.fieldValues) {
      try {
        fieldValues = typeof req.body.fieldValues === 'string'
          ? JSON.parse(req.body.fieldValues)
          : req.body.fieldValues;
      } catch (_) {}
    }

    // Parse new interactive fields to add if requested
    let newFields: Array<{ name: string; type: 'text' | 'checkbox' | 'dropdown'; x: number; y: number; width?: number; height?: number; page?: number; options?: string[] }> = [];
    if (req.body.newFields) {
      try {
        newFields = typeof req.body.newFields === 'string'
          ? JSON.parse(req.body.newFields)
          : req.body.newFields;
      } catch (_) {}
    }

    // 1. Create any new interactive form fields onto pages
    const pages = pdfDoc.getPages();
    for (const nf of newFields) {
      const pageIdx = Math.min(Math.max(0, (nf.page || 1) - 1), pages.length - 1);
      const targetPage = pages[pageIdx];
      const fieldX = nf.x || 50;
      const fieldY = nf.y || 100;
      const fieldW = nf.width || (nf.type === 'checkbox' ? 20 : 200);
      const fieldH = nf.height || (nf.type === 'checkbox' ? 20 : 24);

      if (nf.type === 'text') {
        const tf = form.createTextField(nf.name || `Field_${Date.now()}`);
        tf.addToPage(targetPage, { x: fieldX, y: fieldY, width: fieldW, height: fieldH });
      } else if (nf.type === 'checkbox') {
        const cb = form.createCheckBox(nf.name || `Check_${Date.now()}`);
        cb.addToPage(targetPage, { x: fieldX, y: fieldY, width: fieldW, height: fieldH });
      } else if (nf.type === 'dropdown') {
        const dd = form.createDropdown(nf.name || `Select_${Date.now()}`);
        dd.addToPage(targetPage, { x: fieldX, y: fieldY, width: fieldW, height: fieldH });
        if (nf.options && Array.isArray(nf.options)) {
          dd.setOptions(nf.options);
        }
      }
    }

    // 2. Fill values into form fields
    const allFields = form.getFields();
    for (const field of allFields) {
      const name = field.getName();
      if (fieldValues[name] !== undefined) {
        const val = fieldValues[name];
        if (field instanceof PDFTextField) {
          field.setText(String(val));
        } else if (field instanceof PDFCheckBox) {
          if (val === true || val === 'true' || val === 'on' || val === '1') {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field instanceof PDFDropdown && typeof val === 'string') {
          field.select(val);
        }
      }
    }

    // If user asked to create sample fillable form template when no fields exist
    if (allFields.length === 0 && newFields.length === 0 && req.body.autoCreateTemplate === 'true') {
      const firstPage = pages[0];
      if (firstPage) {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        firstPage.drawText('Interactive Form Fields Added by PDFSketch', {
          x: 50,
          y: 720,
          size: 14,
          font,
          color: rgb(0.1, 0.2, 0.5),
        });

        const nameField = form.createTextField('full_name');
        nameField.setText('John Doe');
        nameField.addToPage(firstPage, { x: 50, y: 670, width: 250, height: 24 });

        const emailField = form.createTextField('email_address');
        emailField.setText('user@example.com');
        emailField.addToPage(firstPage, { x: 50, y: 620, width: 250, height: 24 });

        const agreeBox = form.createCheckBox('terms_accepted');
        agreeBox.check();
        agreeBox.addToPage(firstPage, { x: 50, y: 575, width: 20, height: 20 });
      }
    }

    // Flatten form if requested (makes form values permanent / non-editable)
    if (req.body.flatten === 'true') {
      form.flatten();
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(out, pdfBytes);
    cleanup([req.file.path]);

    sendFile(res, out, `${docName}-form.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
};

router.post('/', upload.single('file'), handleFillOrCreateForm);
router.post('/fill', upload.single('file'), handleFillOrCreateForm);

export default router;
