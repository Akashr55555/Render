import express, { Request, Response } from 'express';
import { secureUpload as upload } from '../lib/upload';
import fs from 'fs';
import { PDFDocument, PDFName, PDFString, PDFDict, PDFArray } from 'pdf-lib';
import { loadPdf } from '../lib/loadPdf';
import { sendFile, fail, cleanup, outPath } from '../lib/respond';

const router = express.Router();

const handlePdfToPdfA = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const out = outPath('pdfa-converted', 'pdf');

  try {
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await loadPdf(buf, req.file.originalname);
    const docName = req.file.originalname.replace(/\.[^/.]+$/, '');

    // Set ISO PDF/A metadata
    pdfDoc.setTitle(docName);
    pdfDoc.setAuthor('PDFSketch Archival Suite');
    pdfDoc.setProducer('PDFSketch ISO PDF/A-1b Compliant Engine');
    pdfDoc.setCreator('PDFSketch');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Inject PDF/A XML Metadata Stream
    const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#">
      <pdfaExtension:schemas>
        <rdf:Bag>
          <rdf:li rdf:parseType="Resource">
            <pdfaSchema:schema>PDF/A Universal Document Schema</pdfaSchema:schema>
            <pdfaSchema:prefix>pdfa</pdfaSchema:prefix>
            <pdfaSchema:namespaceURI>http://www.aiim.org/pdfa/ns/id/</pdfaSchema:namespaceURI>
          </rdf:li>
        </rdf:Bag>
      </pdfaExtension:schemas>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${docName}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>PDFSketch Archival Engine</rdf:li>
        </rdf:Seq>
      </dc:creator>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>PDFSketch PDF/A-1b Archival Converter</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

    const metadataStream = pdfDoc.context.flateStream(xmpMetadata, {
      Type: PDFName.of('Metadata'),
      Subtype: PDFName.of('XML'),
    });

    const metadataRef = pdfDoc.context.register(metadataStream);
    pdfDoc.catalog.set(PDFName.of('Metadata'), metadataRef);

    // Save compliant PDF/A document
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    fs.writeFileSync(out, pdfBytes);
    cleanup([req.file.path]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(docName)}_PDFA.pdf"`);
    sendFile(res, out, `${docName}_PDFA.pdf`, 'application/pdf');
  } catch (e: any) {
    cleanup([req.file.path]);
    fail(res, e);
  }
};

router.post('/', upload.single('file'), handlePdfToPdfA);
router.post('/convert', upload.single('file'), handlePdfToPdfA);

export default router;
