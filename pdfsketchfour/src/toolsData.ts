import { Tool, ToolCategory } from './types';

export const categories: ToolCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'organize', label: 'Organize PDF' },
  { id: 'optimize', label: 'Optimize PDF' },
  { id: 'convert', label: 'Convert PDF' },
  { id: 'edit', label: 'Edit PDF' },
  { id: 'security', label: 'PDF Security' },
  { id: 'intelligence', label: 'PDF Intelligence' },
];

export const tools: Tool[] = [
  // Primary Workflows & Automation
  { id: 'workflow-custom', title: 'Create a workflow', desc: 'Create custom workflows with your favorite tools, automate tasks, and reuse them anytime.', icon: 'summarize', isNew: true, cat: 'workflows' },
  { id: 'workflow-watermark-protect', title: 'Watermark & Protect Workflow', desc: 'Stamp watermark text and encrypt your PDFs with password security in one automated step.', icon: 'watermark', isNew: true, cat: 'workflows' },
  { id: 'workflow-merge-numbers', title: 'Merge, Number & Compress', desc: 'Combine multiple PDFs, add page number index counters, and optimize output size.', icon: 'pagenumbers', isNew: true, cat: 'workflows' },
  { id: 'workflow-rotate-crop', title: 'Rotate, Crop & Watermark', desc: 'Fix page orientation, trim margins, and apply brand watermark stamps simultaneously.', icon: 'crop', isNew: true, cat: 'workflows' },

  // Organize PDF
  { id: 'merge', title: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: 'merge', cat: 'organize' },
  { id: 'split', title: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: 'split', cat: 'organize' },
  { id: 'organize', title: 'Organize PDF', desc: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.', icon: 'organize', cat: 'organize' },
  { id: 'scan', title: 'Scan to PDF', desc: 'Capture document scans from your mobile device and send them instantly to your browser.', icon: 'scan', cat: 'organize' },

  // Optimize PDF
  { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size while optimizing for maximal PDF quality.', icon: 'compress', cat: 'optimize' },
  { id: 'repair', title: 'Repair PDF', desc: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.', icon: 'repair', cat: 'optimize' },
  { id: 'ocr', title: 'OCR PDF', desc: 'Easily convert scanned PDF into searchable and selectable documents.', icon: 'ocr', cat: 'optimize' },

  // Convert PDF
  { id: 'pdftoword', title: 'PDF to Word', desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.', icon: 'pdfword', cat: 'convert' },
  { id: 'pdftoppt', title: 'PDF to PowerPoint', desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', icon: 'pdfppt', cat: 'convert' },
  { id: 'pdftoexcel', title: 'PDF to Excel', desc: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: 'pdfexcel', cat: 'convert' },
  { id: 'wordpdf', title: 'Word to PDF', desc: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: 'wordpdf', cat: 'convert' },
  { id: 'ppttopdf', title: 'PowerPoint to PDF', desc: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', icon: 'ppttopdf', cat: 'convert' },
  { id: 'exceltopdf', title: 'Excel to PDF', desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: 'exceltopdf', cat: 'convert' },
  { id: 'pdftojpg', title: 'PDF to JPG', desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', icon: 'pdfjpg', cat: 'convert' },
  { id: 'jpgtopdf', title: 'JPG to PDF', desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', icon: 'jpgpdf', cat: 'convert' },
  { id: 'htmltopdf', title: 'HTML to PDF', desc: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.', icon: 'htmltopdf', cat: 'convert' },
  { id: 'pdftopdfa', title: 'PDF to PDF/A', desc: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.', icon: 'pdftopdfa', cat: 'convert' },

  // Edit PDF
  { id: 'edit', title: 'Edit PDF', desc: 'Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.', icon: 'edit', cat: 'edit' },
  { id: 'rotate', title: 'Rotate PDF', desc: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!', icon: 'rotate', cat: 'edit' },
  { id: 'pagenumbers', title: 'Page numbers', desc: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.', icon: 'pagenumbers', cat: 'edit' },
  { id: 'crop', title: 'Crop PDF', desc: 'Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.', icon: 'crop', cat: 'edit' },
  { id: 'watermark', title: 'Watermark', desc: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.', icon: 'watermark', cat: 'edit' },
  { id: 'sign', title: 'Sign PDF', desc: 'Sign yourself or request electronic signatures from others.', icon: 'sign', cat: 'edit' },
  { id: 'forms', title: 'PDF Forms', desc: 'Detect form fields automatically, create interactive fillable PDFs, or fill PDF forms yourself. Add text fields, checkboxes, multiple choice fields, and lists.', icon: 'forms', isNew: true, cat: 'edit' },

  // PDF Security
  { id: 'unlock', title: 'Unlock PDF', desc: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', icon: 'unlock', cat: 'security' },
  { id: 'protect', title: 'Protect PDF', desc: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.', icon: 'protect', cat: 'security' },
  { id: 'redact', title: 'Redact PDF', desc: 'Redact text and graphics to permanently remove sensitive information from a PDF.', icon: 'redact', cat: 'security' },

  // PDF Intelligence
  { id: 'compare', title: 'Compare PDF', desc: 'Show a side-by-side document comparison and easily spot changes between different file versions.', icon: 'compare', cat: 'intelligence' },
  { id: 'summarize', title: 'AI Summarizer', desc: 'Quickly generate concise summaries from articles, paragraphs, and essays, providing clear and precise key points in seconds.', icon: 'summarize', isNew: true, cat: 'intelligence' },
  { id: 'translate', title: 'Translate PDF', desc: 'Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.', icon: 'translate', isNew: true, cat: 'intelligence' },
  { id: 'pdftomd', title: 'PDF to Markdown', desc: 'Easily turn PDFs into Markdown files. Perfect for notes, docs, and LLMs. Headings, tables, lists, and links preserved automatically.', icon: 'markdown', isNew: true, cat: 'intelligence' },
];
