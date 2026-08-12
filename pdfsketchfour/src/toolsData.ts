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
  // Workflows
  { id: 'workflow-custom', title: 'Custom Multi-Step Pipeline', desc: 'Build and run automated multi-step workflows: Combine Merge, Rotate, Watermark, Page Numbers, Crop & Password Security in 1-click.', icon: 'summarize', isNew: true, cat: 'workflows' },
  { id: 'workflow-watermark-protect', title: 'Watermark & Protect Workflow', desc: 'Stamp watermark text and encrypt your PDFs with password security in one automated step.', icon: 'watermark', isNew: true, cat: 'workflows' },
  { id: 'workflow-merge-numbers', title: 'Merge, Number & Compress', desc: 'Combine multiple PDFs, add page number index counters, and optimize output size.', icon: 'pagenumbers', isNew: true, cat: 'workflows' },
  { id: 'workflow-rotate-crop', title: 'Rotate, Crop & Watermark', desc: 'Fix page orientation, trim margins, and apply brand watermark stamps simultaneously.', icon: 'crop', isNew: true, cat: 'workflows' },

  // Organize
  { id: 'merge', title: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: 'merge', cat: 'organize' },
  { id: 'split', title: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: 'split', cat: 'organize' },
  { id: 'organize', title: 'Organize PDF', desc: 'Sort pages of your PDF file however you like. Delete or add PDF pages at your convenience.', icon: 'organize', cat: 'organize' },
  { id: 'rotate', title: 'Rotate PDF', desc: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!', icon: 'rotate', cat: 'edit' },
  { id: 'pagenumbers', title: 'Page numbers', desc: 'Add page numbers into PDFs with ease. Choose positions, dimensions, typography.', icon: 'pagenumbers', cat: 'edit' },
  { id: 'crop', title: 'Crop PDF', desc: 'Crop margins of PDF documents or select specific areas, then apply changes to pages.', icon: 'crop', cat: 'edit' },

  // Optimize
  { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size while optimizing for maximal PDF quality.', icon: 'compress', cat: 'optimize' },
  { id: 'repair', title: 'Repair PDF', desc: 'Repair a damaged PDF and recover data from corrupt PDF file structures.', icon: 'repair', cat: 'optimize' },
  { id: 'ocr', title: 'OCR PDF', desc: 'Easily convert scanned PDF into searchable and selectable documents.', icon: 'ocr', cat: 'optimize' },

  // Convert
  { id: 'pdftoword', title: 'PDF to Word', desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', icon: 'pdfword', cat: 'convert' },
  { id: 'pdftoppt', title: 'PDF to PowerPoint', desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', icon: 'pdfppt', cat: 'convert' },
  { id: 'pdftoexcel', title: 'PDF to Excel', desc: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: 'pdfexcel', cat: 'convert' },
  { id: 'pdftojpg', title: 'PDF to JPG', desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', icon: 'pdfjpg', cat: 'convert' },
  { id: 'pdftopng', title: 'PDF to PNG', desc: 'Convert each PDF page into high-quality PNG image files.', icon: 'pdfjpg', cat: 'convert' },
  { id: 'wordpdf', title: 'Word to PDF', desc: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: 'wordpdf', cat: 'convert' },
  { id: 'jpgtopdf', title: 'JPG to PDF', desc: 'Convert JPG/PNG images to PDF in seconds. Adjust orientation and margins.', icon: 'jpgpdf', cat: 'convert' },

  // Edit & Security
  { id: 'edit', title: 'Edit PDF', desc: 'Add text, images, shapes or freehand annotations to a PDF document.', icon: 'edit', cat: 'edit' },
  { id: 'watermark', title: 'Watermark', desc: 'Stamp an image or text over your PDF in seconds. Choose typography & position.', icon: 'watermark', cat: 'edit' },
  { id: 'protect', title: 'Protect PDF', desc: 'Protect PDF files with a password. Encrypt PDF documents securely.', icon: 'protect', cat: 'security' },
  { id: 'unlock', title: 'Unlock PDF', desc: 'Remove PDF password security, giving you freedom to use your PDFs.', icon: 'unlock', cat: 'security' },

  // Intelligence
  { id: 'pdftomd', title: 'PDF to Markdown', desc: 'Easily turn PDFs into Markdown files for notes, docs, and AI prompts.', icon: 'markdown', isNew: true, cat: 'intelligence' },
  { id: 'summarize', title: 'AI Summarizer', desc: 'Quickly generate concise summaries from PDF articles and documents.', icon: 'summarize', isNew: true, cat: 'intelligence' },
];
