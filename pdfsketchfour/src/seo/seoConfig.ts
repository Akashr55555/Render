import { SeoRouteConfig, FAQItem, HowToStep, FeatureItem } from './seoTypes';

export const SITE_DOMAIN = 'https://pdfsketch.com';
export const BASE_URL = 'https://pdfsketch.com';
export const SITE_NAME = 'PDFSketch';
export const DEFAULT_OG_IMAGE = 'https://pdfsketch.com/assets/og-image.png';

export const SUPPORTED_LOCALES = [
  'zh', 'hi', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'mr'
];

export interface ToolSeoData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  canonical: string;
  relatedToolSlugs: string[];
  howToSteps: { name: string; text: string }[];
  faqs: { question: string; answer: string }[];
  features: { title: string; description: string }[];
}

export const routeConfigs: Record<string, SeoRouteConfig> = {
  '/': {
    slug: '',
    path: '/',
    title: 'PDFSketch – Free Online PDF Tools: Merge, Compress, Edit & Convert',
    description: 'Every tool you need to work with PDFs in one place. Merge, split, compress, edit, convert, sign, watermark, protect, and OCR PDF documents 100% free and secure.',
    h1: 'Every tool you need to work with PDFs in one place',
    subtitle: 'Free, browser-first PDF suite with high-speed WebAssembly processing and privacy-first design.',
    quickAnswer: 'PDFSketch provides 30+ browser-based and server-assisted PDF tools for converting, compressing, editing, organizing, and securing documents.',
    howTo: [
      { step: 1, title: 'Choose a Tool', desc: 'Select from our wide suite of PDF tools for merging, editing, converting, or optimizing.' },
      { step: 2, title: 'Upload Your Files', desc: 'Drag and drop your PDF documents into the browser canvas or cloud loader.' },
      { step: 3, title: 'Process & Download', desc: 'Apply your actions and download the high-quality output instantly.' }
    ],
    features: [
      { title: 'Privacy-First Architecture', desc: 'Client-side processing where possible with automatic in-memory cleanup.' },
      { title: 'No File Size Limits', desc: 'Process single documents or batch workloads without intrusive paywalls.' },
      { title: 'Cross-Platform Ready', desc: 'Works seamlessly across modern desktop, tablet, and mobile browsers.' }
    ],
    securityText: 'TLS 1.3 encryption, automatic ephemeral memory wiping, and ISO/IEC 27001 security standards.',
    faqs: [
      { question: 'Is PDFSketch free to use?', answer: 'Yes, PDFSketch offers a comprehensive set of free PDF utilities with no mandatory registration.' },
      { question: 'Are my files kept private and secure?', answer: 'Yes. Files are processed client-side or on ephemeral servers and wiped automatically within 30 minutes.' },
      { question: 'What tools are included in PDFSketch?', answer: 'Merge, Split, Compress, PDF to Word/Excel/PPT, OCR, Edit, Sign, Watermark, Protect, Unlock, Redact, and AI summaries.' }
    ],
    relatedToolIds: ['merge', 'compress', 'pdftoword', 'edit', 'sign', 'ocr'],
    breadcrumbs: [{ name: 'Home', path: '/' }]
  },

  // ---------- CORE TOOLS ----------
  '/merge-pdf/': {
    slug: 'merge-pdf',
    path: '/merge-pdf/',
    toolId: 'merge',
    title: 'Merge PDF Online – Combine PDF Files Free & Securely | PDFSketch',
    description: 'Combine multiple PDF files into one single document online with PDFSketch. 100% free, fast client-side privacy, reorder pages, and zero file limits.',
    h1: 'Merge PDF Files Online Fast & Securely',
    subtitle: 'Combine multiple PDF documents into a single organized file in seconds.',
    quickAnswer: 'Upload multiple PDFs, reorder the thumbnails to your desired order, and click "Merge PDF" to download a combined file instantly.',
    howTo: [
      { step: 1, title: 'Select PDFs', desc: 'Drag and drop your PDF files into the upload box.' },
      { step: 2, title: 'Reorder Files', desc: 'Drag thumbnails to arrange your desired document sequence.' },
      { step: 3, title: 'Merge & Download', desc: 'Click "Merge PDF" and save your joined PDF immediately.' }
    ],
    features: [
      { title: 'Drag & Drop Page Sorting', desc: 'Easily rearrange files or individual pages before merging.' },
      { title: 'Blazing Fast Processing', desc: 'Combines multi-page documents in milliseconds using WebAssembly.' },
      { title: 'Zero Data Tracking', desc: 'Documents remain completely private and confidential.' }
    ],
    securityText: 'Processed in-memory with strict encryption and zero permanent storage.',
    faqs: [
      { question: 'How many PDF files can I merge at once?', answer: 'You can merge dozens of PDF documents at once without arbitrary batch caps.' },
      { question: 'Can I merge password-protected PDFs?', answer: 'You must first unlock the PDF using our Unlock tool, then merge it.' },
      { question: 'Will the quality of my PDFs degrade after merging?', answer: 'No, PDFSketch preserves full vector text, original font subsets, and high-resolution images.' }
    ],
    relatedToolIds: ['split', 'compress', 'organize', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Merge PDF', path: '/merge-pdf/' }]
  },

  '/split-pdf/': {
    slug: 'split-pdf',
    path: '/split-pdf/',
    toolId: 'split',
    title: 'Split PDF Online – Extract Pages from PDF Free | PDFSketch',
    description: 'Split a PDF into separate files or extract specific page ranges in seconds with PDFSketch. Fast, free, and accurate page extraction.',
    h1: 'Split PDF Files & Extract Custom Pages Online',
    subtitle: 'Separate pages or extract custom page intervals into standalone PDF documents.',
    quickAnswer: 'Upload your PDF, select specific page numbers or ranges (e.g., 1-3, 5, 8-10), and click "Split PDF".',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Choose the PDF file you wish to split or extract from.' },
      { step: 2, title: 'Specify Ranges', desc: 'Choose custom page ranges or separate every single page.' },
      { step: 3, title: 'Download Split Files', desc: 'Export the individual files or download a single organized ZIP archive.' }
    ],
    features: [
      { title: 'Visual Page Selector', desc: 'Click on individual page thumbnails to select or exclude them.' },
      { title: 'Range Parsing', desc: 'Support for comma-separated ranges like 1-5, 8, 12-20.' },
      { title: 'Bulk ZIP Export', desc: 'Download all extracted documents bundled in a clean archive.' }
    ],
    securityText: 'Encrypted transmission and memory-only file processing.',
    faqs: [
      { question: 'Can I extract all pages into separate PDFs?', answer: 'Yes, choose the "Extract all pages" mode to save every page as an individual file.' },
      { question: 'Does splitting affect bookmarks or links?', answer: 'Page-level contents and vector objects are strictly preserved.' }
    ],
    relatedToolIds: ['merge', 'organize', 'crop', 'pagenumbers'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Split PDF', path: '/split-pdf/' }]
  },

  '/compress-pdf/': {
    slug: 'compress-pdf',
    path: '/compress-pdf/',
    toolId: 'compress',
    title: 'Compress PDF Online – Reduce PDF File Size Free | PDFSketch',
    description: 'Reduce PDF file sizes quickly without losing image resolution or formatting. Optimize your PDFs for email and web uploading.',
    h1: 'Compress PDF Documents with Maximum Quality',
    subtitle: 'Shrink oversized PDF files down to lightweight, email-ready sizes.',
    quickAnswer: 'Drop your PDF into the compressor, choose your compression profile (Extreme, Recommended, or Low), and download your reduced file.',
    howTo: [
      { step: 1, title: 'Choose Document', desc: 'Select the large PDF file you need to optimize.' },
      { step: 2, title: 'Select Compression Level', desc: 'Choose between Extreme, Recommended, or High Quality compression.' },
      { step: 3, title: 'Download Compressed PDF', desc: 'Save your optimized PDF with up to 80% smaller file size.' }
    ],
    features: [
      { title: 'Adaptive Compression', desc: 'Removes redundant metadata and downsamples images smartly.' },
      { title: 'Email-Ready Outputs', desc: 'Shrinks large PDF attachments under standard 25MB limits.' },
      { title: 'Vector Clarity', desc: 'Text and line art remain crisp and clean at any zoom level.' }
    ],
    securityText: 'Strict ephemeral memory execution. Files are never retained.',
    faqs: [
      { question: 'Will compressing decrease image clarity?', answer: 'Our intelligent algorithms preserve vector text and downscale images proportionally to maintain readability.' },
      { question: 'What is the maximum file size supported?', answer: 'PDFSketch supports files up to 200MB free of charge.' }
    ],
    relatedToolIds: ['merge', 'pdftojpg', 'pdftopdfa', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Compress PDF', path: '/compress-pdf/' }]
  },

  '/pdf-to-word/': {
    slug: 'pdf-to-word',
    path: '/pdf-to-word/',
    toolId: 'pdftoword',
    title: 'PDF to Word Converter Online – Convert PDF to DOCX Free | PDFSketch',
    description: 'Convert PDF documents to editable Microsoft Word (DOCX) files with unmatched OCR accuracy and layout preservation.',
    h1: 'Convert PDF to Editable Microsoft Word (DOCX)',
    subtitle: 'Transform non-editable PDFs into fully formatted Word documents.',
    quickAnswer: 'Upload your PDF, let our conversion engine reconstruct paragraphs and tables, and download an editable .docx file.',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Select the PDF file you want to convert.' },
      { step: 2, title: 'Process Document', desc: 'Our engine extracts text, tables, and images while maintaining formatting.' },
      { step: 3, title: 'Download Word File', desc: 'Open and edit the resulting DOCX document in Microsoft Word or Google Docs.' }
    ],
    features: [
      { title: 'High-Precision Layout Matching', desc: 'Preserves fonts, margins, bullet points, and multi-column tables.' },
      { title: 'Scanned PDF Support', desc: 'Integrated OCR reads scanned pages and outputs selectable text.' },
      { title: '100% Editable DOCX', desc: 'Clean native Word elements instead of trapped raster images.' }
    ],
    securityText: 'All conversions occur in isolated worker containers with immediate cleanup.',
    faqs: [
      { question: 'Can I convert scanned PDFs to Word?', answer: 'Yes! Scanned PDFs are automatically processed with OCR.' },
      { question: 'Will my tables and lists stay formatted?', answer: 'Yes, our layout reconstruction accurately converts PDF tables into editable Word tables.' }
    ],
    relatedToolIds: ['wordpdf', 'pdftoexcel', 'ocr', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'PDF to Word', path: '/pdf-to-word/' }]
  },

  '/edit-pdf/': {
    slug: 'edit-pdf',
    path: '/edit-pdf/',
    toolId: 'edit',
    title: 'Edit PDF Online – Annotate, Add Text & Draw on PDF | PDFSketch',
    description: 'Full-featured free online PDF editor. Add text, shapes, signatures, whiteouts, and highlights straight from your browser.',
    h1: 'Interactive Online PDF Editor',
    subtitle: 'Annotate, type text, add images, draw shapes, and highlight content directly in your browser.',
    quickAnswer: 'Open your PDF in our interactive editor toolbar, insert text boxes, annotations, or drawings, and download the edited file.',
    howTo: [
      { step: 1, title: 'Open Document', desc: 'Upload the PDF you want to edit.' },
      { step: 2, title: 'Modify & Annotate', desc: 'Use the interactive toolbar to insert text, drawings, highlights, or shapes.' },
      { step: 3, title: 'Save & Export', desc: 'Download your updated PDF with all annotations baked in.' }
    ],
    features: [
      { title: 'Rich Annotation Suite', desc: 'Pencil, highlighter, shapes, text boxes, and eraser.' },
      { title: 'Vector-Sharp Rendering', desc: 'Inserted text and lines maintain high resolution.' },
      { title: 'No Watermarks Added', desc: 'Export clean PDFs without any branding stamps.' }
    ],
    securityText: 'Browser-native rendering without unnecessary server roundtrips.',
    faqs: [
      { question: 'Can I edit existing text in a PDF?', answer: 'You can overlay new text, whiteout sections, and add annotations anywhere on the page.' },
      { question: 'Can I sign documents in the editor?', answer: 'Yes, you can draw or insert custom digital signatures directly on the canvas.' }
    ],
    relatedToolIds: ['sign', 'redact', 'watermark', 'forms'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Edit PDF', path: '/edit-pdf/' }]
  },

  '/sign-pdf/': {
    slug: 'sign-pdf',
    path: '/sign-pdf/',
    toolId: 'sign',
    title: 'Sign PDF Online – Electronic Signatures for PDF Free | PDFSketch',
    description: 'Create, sign, and fill electronic signatures on PDF documents online. Legally binding, secure, and intuitive.',
    h1: 'Sign PDF Documents Online Free & Securely',
    subtitle: 'Add legally valid electronic signatures, initials, dates, and text to contracts.',
    quickAnswer: 'Upload your document, draw or type your electronic signature, position it on the target line, and download your signed PDF.',
    howTo: [
      { step: 1, title: 'Upload Contract', desc: 'Choose the document that requires your signature.' },
      { step: 2, title: 'Create Signature', desc: 'Draw using mouse/touchscreen, type your name, or upload an image.' },
      { step: 3, title: 'Apply & Save', desc: 'Position the signature stamp on the page and download the finalized PDF.' }
    ],
    features: [
      { title: 'Touch-Friendly Signature Pad', desc: 'Draw smooth, natural signatures with stylus or finger.' },
      { title: 'Saved Signature Profiles', desc: 'Store your signature securely in your local browser for rapid reuse.' },
      { title: 'Date & Initial Stamps', desc: 'Easily attach date markers and initial boxes alongside signatures.' }
    ],
    securityText: 'Signatures are placed client-side with zero exposure to external databases.',
    faqs: [
      { question: 'Are PDFSketch electronic signatures legally valid?', answer: 'Yes, electronic signatures created with PDFSketch comply with standard ESIGN and eIDAS frameworks.' },
      { question: 'Can I sign on my mobile phone or iPad?', answer: 'Yes, our signature pad is optimized for finger and stylus input on mobile devices.' }
    ],
    relatedToolIds: ['edit', 'protect', 'forms', 'watermark'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Sign PDF', path: '/sign-pdf/' }]
  },

  '/ocr-pdf/': {
    slug: 'ocr-pdf',
    path: '/ocr-pdf/',
    toolId: 'ocr',
    title: 'OCR PDF Online – Convert Scanned PDF to Searchable Text | PDFSketch',
    description: 'Extract text from scanned PDF documents and images with AI-powered OCR. Search, copy, and edit text from any scan.',
    h1: 'Optical Character Recognition (OCR) for PDFs',
    subtitle: 'Convert scanned documents and images into selectable, searchable PDF text.',
    quickAnswer: 'Upload your scanned document, select recognition languages, and run OCR to generate a searchable PDF.',
    howTo: [
      { step: 1, title: 'Upload Scanned File', desc: 'Select the scanned PDF or image file.' },
      { step: 2, title: 'Select Language', desc: 'Pick the document language for maximum OCR accuracy.' },
      { step: 3, title: 'Download Searchable PDF', desc: 'Export a PDF with an invisible text layer allowing copy/paste and search.' }
    ],
    features: [
      { title: 'Multi-Language Support', desc: 'Accurate recognition for English, Spanish, German, French, Chinese, and 20+ languages.' },
      { title: 'Invisible Text Overlay', desc: 'Retains the original visual look while making text copyable and searchable.' },
      { title: 'High-Accuracy Engine', desc: 'Handles skewed, low-contrast, and multi-column scans.' }
    ],
    securityText: 'Encrypted transmission and memory-isolated OCR workers.',
    faqs: [
      { question: 'What languages are supported?', answer: 'Over 25 major languages including Latin, Cyrillic, and CJK character sets.' },
      { question: 'Can I export text directly to Markdown or TXT?', answer: 'Yes, you can extract plain text, Markdown, or download a searchable PDF.' }
    ],
    relatedToolIds: ['pdftoword', 'compress', 'scan'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'OCR PDF', path: '/ocr-pdf/' }]
  },

  '/pdf-to-excel/': {
    slug: 'pdf-to-excel',
    path: '/pdf-to-excel/',
    toolId: 'pdftoexcel',
    title: 'PDF to Excel Converter Online – Convert PDF to XLSX Free | PDFSketch',
    description: 'Extract tables and financial data from PDF documents into editable Microsoft Excel (XLSX) spreadsheets.',
    h1: 'Convert PDF to Microsoft Excel (XLSX)',
    subtitle: 'Extract data tables and spreadsheets from PDF to Excel in seconds.',
    quickAnswer: 'Upload your PDF containing data tables and download a cleanly structured Microsoft Excel spreadsheet.',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Select your statement, invoice, or data report.' },
      { step: 2, title: 'Table Detection', desc: 'Our engine identifies rows, columns, and numeric cell formats.' },
      { step: 3, title: 'Download XLSX', desc: 'Open and compute your formulas directly in Excel.' }
    ],
    features: [
      { title: 'Auto Table Detection', desc: 'Automatically aligns rows and columns without manual grid snapping.' },
      { title: 'Numeric Precision', desc: 'Preserves numbers, currencies, dates, and headers accurately.' },
      { title: 'Multi-Page Sheets', desc: 'Converts multi-page tables into organized workbooks.' }
    ],
    securityText: 'Bank-grade encryption with immediate file disposal.',
    faqs: [
      { question: 'Can it convert bank statements into Excel?', answer: 'Yes, financial reports and statements are converted into structured spreadsheets.' },
      { question: 'Does it support scanned tables?', answer: 'Yes, OCR extracts tabular data even from scanned physical documents.' }
    ],
    relatedToolIds: ['exceltopdf', 'pdftoword', 'ocr'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'PDF to Excel', path: '/pdf-to-excel/' }]
  },

  '/word-to-pdf/': {
    slug: 'word-to-pdf',
    path: '/word-to-pdf/',
    toolId: 'wordpdf',
    title: 'Word to PDF Converter Online – Convert DOCX to PDF Free | PDFSketch',
    description: 'Convert Microsoft Word documents (DOC, DOCX) to high-quality PDF files online for free.',
    h1: 'Convert Word DOCX to PDF Online',
    subtitle: 'Lock in your formatting and produce professional PDFs from Word documents.',
    quickAnswer: 'Upload your .docx or .doc file and convert it into a standard PDF document instantly.',
    howTo: [
      { step: 1, title: 'Upload Word File', desc: 'Select the .doc or .docx document from your device.' },
      { step: 2, title: 'Convert', desc: 'Our engine renders typography, tables, and images into PDF.' },
      { step: 3, title: 'Download PDF', desc: 'Save your print-ready, universally viewable PDF.' }
    ],
    features: [
      { title: 'True Type Font Embedding', desc: 'Ensures your document looks identical on any computer or phone.' },
      { title: 'Lossless Visual Output', desc: 'Preserves high-resolution photos and vector shapes.' },
      { title: 'Instant Processing', desc: 'Converts multi-page Word files in seconds.' }
    ],
    securityText: 'Encrypted transmission and memory-isolated conversion.',
    faqs: [
      { question: 'Can I convert .doc and .docx formats?', answer: 'Yes, all standard Word formats from Word 97 through modern Office 365 are supported.' },
      { question: 'Will my fonts change?', answer: 'Fonts and layouts are preserved and embedded into the PDF structure.' }
    ],
    relatedToolIds: ['pdftoword', 'exceltopdf', 'ppttopdf'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Word to PDF', path: '/word-to-pdf/' }]
  },

  '/protect-pdf/': {
    slug: 'protect-pdf',
    path: '/protect-pdf/',
    toolId: 'protect',
    title: 'Protect PDF Online – Encrypt PDF with Password Free | PDFSketch',
    description: 'Encrypt your PDF with strong AES-256 password protection to prevent unauthorized viewing, printing, and editing.',
    h1: 'Password Protect and Encrypt PDF Documents',
    subtitle: 'Secure sensitive PDF files with robust AES password encryption.',
    quickAnswer: 'Upload your PDF, enter a strong password, choose permission settings, and download your protected file.',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Select the file you need to encrypt.' },
      { step: 2, title: 'Set Password', desc: 'Enter your secure open password and optional owner restrictions.' },
      { step: 3, title: 'Download Protected PDF', desc: 'Save your encrypted file that requires a password to open.' }
    ],
    features: [
      { title: 'AES-256 Bit Encryption', desc: 'Industry-standard encryption that meets enterprise compliance.' },
      { title: 'Permission Control', desc: 'Restrict printing, copying text, or editing if desired.' },
      { title: 'Zero Password Storage', desc: 'We never store or transmit your passwords to any server.' }
    ],
    securityText: 'Cryptographically secure AES algorithms executed in memory.',
    faqs: [
      { question: 'Can anyone open the file without the password?', answer: 'No. AES-256 encryption prevents unauthorized access without the exact passphrase.' },
      { question: 'Can I remove the password later?', answer: 'Yes, you can unlock it anytime using our Unlock PDF tool with the correct password.' }
    ],
    relatedToolIds: ['unlock', 'redact', 'watermark'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Protect PDF', path: '/protect-pdf/' }]
  },

  '/unlock-pdf/': {
    slug: 'unlock-pdf',
    path: '/unlock-pdf/',
    toolId: 'unlock',
    title: 'Unlock PDF Online – Remove PDF Password Security Free | PDFSketch',
    description: 'Remove passwords and permissions from encrypted PDF files so you can easily edit, copy, and print your documents.',
    h1: 'Unlock Password-Protected PDF Documents',
    subtitle: 'Strip password restrictions and unlock your PDFs for unrestricted access.',
    quickAnswer: 'Upload your protected PDF, provide the authorization password, and download an unlocked version.',
    howTo: [
      { step: 1, title: 'Upload Protected PDF', desc: 'Select the password-encrypted document.' },
      { step: 2, title: 'Provide Password', desc: 'Enter the password once to authorize removal.' },
      { step: 3, title: 'Download Decrypted PDF', desc: 'Save a clean PDF that opens freely without prompts.' }
    ],
    features: [
      { title: 'Instant Decryption', desc: 'Removes user and owner passwords in milliseconds.' },
      { title: 'Permission Removal', desc: 'Enables printing, text extraction, and modifications.' },
      { title: 'Safe Processing', desc: 'Keeps document contents intact without data corruption.' }
    ],
    securityText: 'Private in-browser decryption where possible.',
    faqs: [
      { question: 'Can I unlock a PDF if I forgot the password?', answer: 'For owner-permission restricted files, PDFSketch can remove locks. Strong open passwords require authorization.' },
      { question: 'Does unlocking damage the PDF structure?', answer: 'No, vector graphics, text layers, and embedded media are 100% preserved.' }
    ],
    relatedToolIds: ['protect', 'edit', 'merge'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Unlock PDF', path: '/unlock-pdf/' }]
  },

  '/redact-pdf/': {
    slug: 'redact-pdf',
    path: '/redact-pdf/',
    toolId: 'redact',
    title: 'Redact PDF Online – Permanently Black Out Sensitive Info | PDFSketch',
    description: 'Permanently remove sensitive text, numbers, and graphics from PDF documents with true cryptographic redaction.',
    h1: 'Redact & Black Out Sensitive Information in PDFs',
    subtitle: 'Permanently remove PII, SSNs, financial details, and confidential text from PDF pages.',
    quickAnswer: 'Select the text or draw blackout boxes over sensitive areas, then apply irreversible permanent redaction.',
    howTo: [
      { step: 1, title: 'Upload Document', desc: 'Select the PDF containing confidential information.' },
      { step: 2, title: 'Select Areas to Redact', desc: 'Highlight text or drag black boxes over private data.' },
      { step: 3, title: 'Apply Permanent Redaction', desc: 'Download a cleansed document with underlying text layers deleted permanently.' }
    ],
    features: [
      { title: 'True Irreversible Redaction', desc: 'Deletes underlying vector and text streams, preventing copy-paste recovery.' },
      { title: 'Pattern Search & Redact', desc: 'Quickly find and black out emails, phone numbers, or credit cards.' },
      { title: 'Metadata Sanitization', desc: 'Removes author names, revision history, and hidden document metadata.' }
    ],
    securityText: 'Cryptographically sanitized with destructive underlying stream purging.',
    faqs: [
      { question: 'Can someone undo the black box to see what is underneath?', answer: 'No! Unlike simple draw tools, our Redaction engine destroys the underlying text and vectors permanently.' },
      { question: 'Does it remove metadata like author and creation dates?', answer: 'Yes, our redaction tool sanitizes hidden XML and metadata properties.' }
    ],
    relatedToolIds: ['protect', 'edit', 'watermark'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Redact PDF', path: '/redact-pdf/' }]
  },

  // ---------- COMMERCIAL B2B PAGES ----------
  '/pricing/': {
    slug: 'pricing',
    path: '/pricing/',
    title: 'Pricing & Plans – PDFSketch Free & Premium Tiers',
    description: 'Transparent pricing for individual professionals, teams, and enterprise organizations. Enjoy free daily access or upgrade for limitless batch automation.',
    h1: 'Simple, Transparent Pricing for Everyone',
    subtitle: 'From individual freelancers to global enterprises, choose the PDF plan tailored to your workflow.',
    quickAnswer: 'PDFSketch is free for standard daily workflows. PDFSketch Pro offers unlimited batch size, OCR priority, and custom automated workflows for $6/month.',
    isCommercial: true,
    howTo: [
      { step: 1, title: 'Choose Your Plan', desc: 'Select Free, Pro, or Enterprise depending on your processing volume.' },
      { step: 2, title: 'Instant Activation', desc: 'Upgrade instantly with Stripe secure checkout.' },
      { step: 3, title: 'Enjoy Limitless Processing', desc: 'Access 200MB file limits, unlimited OCR, and automated team workflows.' }
    ],
    features: [
      { title: 'Free Forever Tier', desc: 'Access all essential PDF tools daily with generous quotas and no credit card required.' },
      { title: 'PDFSketch Pro ($6/mo)', desc: 'Unlimited file sizes, batch automation, OCR multi-page engine, and priority speed.' },
      { title: 'Enterprise & Teams', desc: 'Dedicated cloud instances, SOC-2 compliance, SAML SSO, and centralized team billing.' }
    ],
    securityText: 'PCI-DSS Level 1 payment processing via Stripe with instant cancel-anytime policy.',
    faqs: [
      { question: 'Can I cancel my subscription at any time?', answer: 'Yes, you can cancel your subscription anytime in one click from your billing portal.' },
      { question: 'Is there a free trial for Pro?', answer: 'Yes, new accounts receive a trial period to experience full pro capabilities.' },
      { question: 'What payment methods do you accept?', answer: 'All major credit cards, Apple Pay, Google Pay, and corporate invoicing for annual enterprise tiers.' }
    ],
    relatedToolIds: ['merge', 'compress', 'edit', 'sign'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing/' }]
  },

  '/business/': {
    slug: 'business',
    path: '/business/',
    title: 'PDFSketch for Business – Scalable Document Infrastructure',
    description: 'Empower your enterprise with secure, scalable PDF tooling. Automated contract signing, OCR data extraction, and GDPR compliance.',
    h1: 'Enterprise-Grade Document Infrastructure for Business',
    subtitle: 'Streamline document operations, contracts, and compliance across your entire organization.',
    quickAnswer: 'PDFSketch Business equips companies with centralized licensing, volume OCR, automated pipelines, and strict security compliance.',
    isCommercial: true,
    howTo: [
      { step: 1, title: 'Consult with Our Team', desc: 'Discuss your volume, compliance, and integration requirements.' },
      { step: 2, title: 'Deploy Workspace', desc: 'Provision team members with SSO and custom permission controls.' },
      { step: 3, title: 'Scale Operations', desc: 'Automate PDF processing and document generation across departments.' }
    ],
    features: [
      { title: 'Dedicated Infrastructure', desc: 'Isolated processing environments with guaranteed SLA uptime.' },
      { title: 'Regulatory Compliance', desc: 'Fully compliant with GDPR, HIPAA, CCPA, and ISO/IEC 27001.' },
      { title: 'Centralized Administration', desc: 'Single-sign-on (SSO), seat management, and consolidated reporting.' }
    ],
    securityText: 'End-to-end data encryption with zero data retention guarantees.',
    faqs: [
      { question: 'Do you offer custom Data Processing Agreements (DPA)?', answer: 'Yes, we provide standard and custom DPAs for enterprise clients.' },
      { question: 'Can we self-host or use private cloud VPCs?', answer: 'Enterprise tiers support deployment to custom Google Cloud or AWS private VPCs.' }
    ],
    relatedToolIds: ['sign', 'ocr', 'redact', 'protect'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Business', path: '/business/' }]
  },

  '/teams/': {
    slug: 'teams',
    path: '/teams/',
    title: 'PDFSketch for Teams – Collaborative PDF Tools & Workflows',
    description: 'Unite your team with shared PDF workflows, e-signatures, form creation, and team license management.',
    h1: 'Collaborative PDF Workflows for Fast-Moving Teams',
    subtitle: 'Eliminate document bottlenecks with shared tools, quick signing, and team licensing.',
    quickAnswer: 'Equip your legal, sales, finance, and operations teams with fast browser-based PDF utilities and centralized seat management.',
    isCommercial: true,
    howTo: [
      { step: 1, title: 'Create Team Workspace', desc: 'Set up your organization domain and invite collaborators.' },
      { step: 2, title: 'Share Workflows', desc: 'Build reusable automation recipes for repetitive PDF tasks.' },
      { step: 3, title: 'Collaborate Seamlessly', desc: 'Sign, annotate, and organize documents together without software installs.' }
    ],
    features: [
      { title: 'Shared Automation Recipes', desc: 'Create custom multi-step workflows like Watermark + Compress + Protect.' },
      { title: 'Flexible Seat Allocation', desc: 'Add or transfer licenses dynamically as your team grows.' },
      { title: 'Activity Logs', desc: 'Audit trails for electronic signatures and document modifications.' }
    ],
    securityText: 'Zero-knowledge encryption for uploaded and processed team documents.',
    faqs: [
      { question: 'Can I manage multiple team members under one bill?', answer: 'Yes, team accounts consolidate billing onto a single monthly or annual invoice.' },
      { question: 'Is there a minimum team size?', answer: 'No, teams can start with as few as 2 members.' }
    ],
    relatedToolIds: ['workflow-custom', 'sign', 'merge', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Teams', path: '/teams/' }]
  },

  '/education/': {
    slug: 'education',
    path: '/education/',
    title: 'PDFSketch for Education – Free & Discounted Tools for Students & Teachers',
    description: 'Empower students, educators, and academic institutions with free and discounted access to PDFSketch Pro tools.',
    h1: 'PDF Tools for Students, Teachers & Academic Institutions',
    subtitle: 'Annotate lecture notes, organize research papers, and convert assignments effortlessly.',
    quickAnswer: 'Students and academic staff can access discounted PDFSketch Pro to highlight textbooks, merge homework submissions, and run OCR on study materials.',
    isCommercial: true,
    howTo: [
      { step: 1, title: 'Verify Academic Email', desc: 'Sign up using your school, university, or educational email domain (.edu).' },
      { step: 2, title: 'Activate Education Plan', desc: 'Receive instant academic discounts and elevated processing limits.' },
      { step: 3, title: 'Study & Create', desc: 'Organize research papers, extract chapter notes, and fill campus forms.' }
    ],
    features: [
      { title: '50% Academic Discount', desc: 'Affordable Pro access for students, teachers, and university staff.' },
      { title: 'Campus-Wide Deployment', desc: 'Bulk licensing for libraries, computer labs, and whole university departments.' },
      { title: 'Research Tools', desc: 'AI Summarizer and OCR PDF to rapidly parse long journal articles.' }
    ],
    securityText: 'FERPA and COPPA compliant educational document safety standards.',
    faqs: [
      { question: 'How do I qualify for the education discount?', answer: 'Sign up with any valid .edu or accredited academic institution email address.' },
      { question: 'Can whole schools get access?', answer: 'Yes, we provide institutional licensing for schools and universities.' }
    ],
    relatedToolIds: ['summarize', 'ocr', 'edit', 'merge'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Education', path: '/education/' }]
  },

  '/security/': {
    slug: 'security',
    path: '/security/',
    title: 'Security & Privacy Architecture – PDFSketch Trust Center',
    description: 'Learn about PDFSketch privacy-by-design architecture, TLS 1.3 encryption, ephemeral memory processing, and compliance standards.',
    h1: 'Privacy by Design & Enterprise-Grade Security',
    subtitle: 'We treat your documents with the highest privacy and confidentiality standards in the industry.',
    quickAnswer: 'PDFSketch processes files locally in the browser or on isolated, ephemeral servers with 256-bit encryption and automatic memory wiping.',
    isCommercial: true,
    howTo: [
      { step: 1, title: 'Encrypted Upload', desc: 'All data is transmitted via end-to-end TLS 1.3 cryptographic tunnels.' },
      { step: 2, title: 'In-Memory Processing', desc: 'Files are processed inside isolated RAM containers without writing to permanent storage.' },
      { step: 3, title: 'Automatic Purging', desc: 'Any temporary processing files are permanently deleted within 30 minutes.' }
    ],
    features: [
      { title: 'Zero Permanent Storage', desc: 'We do not inspect, index, sell, or permanently store your files.' },
      { title: 'Browser-Native Execution', desc: 'Many operations (like Merging and Reordering) run entirely on your device via WebAssembly.' },
      { title: 'GDPR & CCPA Compliant', desc: 'Strict adherence to global data privacy laws and user data rights.' }
    ],
    securityText: 'AES-256 encryption at rest, TLS 1.3 in transit, and continuous security audits.',
    faqs: [
      { question: 'Does PDFSketch read or train AI models on my documents?', answer: 'Never. Your documents are strictly your property and are never used for model training or data mining.' },
      { question: 'How long are files kept on servers?', answer: 'Files are stored only in volatile temporary memory and are automatically expunged after 30 minutes.' }
    ],
    relatedToolIds: ['protect', 'redact', 'unlock'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Security', path: '/security/' }]
  },

  // ---------- KNOWLEDGE HUB & GUIDES ----------
  '/guides/': {
    slug: 'guides',
    path: '/guides/',
    title: 'PDF Knowledge Hub & Step-by-Step Tutorials | PDFSketch',
    description: 'Comprehensive tutorials, technical guides, and practical tips on managing, converting, editing, and securing PDF files.',
    h1: 'PDF Knowledge Hub & Step-by-Step Tutorials',
    subtitle: 'Master PDF workflows with in-depth technical tutorials and best practices.',
    quickAnswer: 'Browse our collection of curated technical guides to solve everyday document challenges.',
    isGuide: true,
    author: 'PDFSketch Technical Team',
    publishedDate: '2026-08-10',
    howTo: [],
    features: [
      { title: 'Comprehensive Tutorials', desc: 'Clear step-by-step instructions with screenshots and pro tips.' },
      { title: 'Format Troubleshooting', desc: 'Resolve common PDF formatting, font mismatch, and corruption errors.' },
      { title: 'Security Best Practices', desc: 'Learn how to properly encrypt and redact sensitive business documents.' }
    ],
    securityText: 'Expert advice verified by certified document engineers.',
    faqs: [
      { question: 'Are these guides free to read?', answer: 'Yes, all guides in the PDFSketch Knowledge Hub are 100% free and publicly accessible.' }
    ],
    relatedToolIds: ['merge', 'compress', 'pdftoword', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }]
  },

  '/guides/how-to-merge-pdf/': {
    slug: 'how-to-merge-pdf',
    path: '/guides/how-to-merge-pdf/',
    toolId: 'merge',
    title: 'How to Merge PDF Files Online Free (Step-by-Step Guide) | PDFSketch',
    description: 'Learn how to combine multiple PDF documents into one single file without losing quality, bookmarks, or formatting.',
    h1: 'How to Merge PDF Files Online for Free',
    subtitle: 'A complete tutorial on combining multiple PDFs into one organized document.',
    quickAnswer: 'To merge PDF files: 1. Open PDFSketch Merge PDF. 2. Upload your PDF files. 3. Drag thumbnails to set order. 4. Click "Merge PDF" to download.',
    isGuide: true,
    author: 'Alex Morgan',
    publishedDate: '2026-08-12',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Open the Merge Tool', desc: 'Navigate to the PDFSketch Merge PDF tool page.' },
      { step: 2, title: 'Upload Your Documents', desc: 'Drag and drop all the PDF files you want to combine.' },
      { step: 3, title: 'Arrange Document Order', desc: 'Drag the file cards or page thumbnails into your preferred sequence.' },
      { step: 4, title: 'Click Merge PDF & Download', desc: 'Hit the Merge button and save your unified PDF file instantly.' }
    ],
    features: [
      { title: 'No Installation Required', desc: 'Runs directly inside any browser on Windows, Mac, iOS, or Android.' },
      { title: 'Preserve Vector Quality', desc: 'Vector artwork, embedded fonts, and page dimensions remain flawless.' },
      { title: 'Unlimited File Joining', desc: 'Merge multiple reports, invoices, or presentation decks in one go.' }
    ],
    securityText: 'Processed in browser memory with zero tracking.',
    faqs: [
      { question: 'Can I merge PDFs on a mobile phone?', answer: 'Yes! PDFSketch works smoothly on mobile Safari, Chrome, and Samsung Internet.' },
      { question: 'Will the merged PDF lose quality?', answer: 'No, PDFSketch retains original vector resolutions and font sub-settings.' }
    ],
    relatedToolIds: ['split', 'compress', 'organize'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'How to Merge PDF', path: '/guides/how-to-merge-pdf/' }]
  },

  '/guides/how-to-compress-pdf-without-losing-quality/': {
    slug: 'how-to-compress-pdf-without-losing-quality',
    path: '/guides/how-to-compress-pdf-without-losing-quality/',
    toolId: 'compress',
    title: 'How to Compress a PDF Without Losing Quality (3 Easy Methods) | PDFSketch',
    description: 'Discover how to reduce oversized PDF file sizes for email and web upload while maintaining crisp text and clear image resolution.',
    h1: 'How to Compress a PDF Without Losing Quality',
    subtitle: 'Learn the exact techniques to shrink PDF file sizes by up to 80% without blurry text.',
    quickAnswer: 'Use PDFSketch Compress PDF with "Recommended Quality" mode to strip binary bloat and optimize images while keeping text 100% crisp.',
    isGuide: true,
    author: 'Elena Rostova',
    publishedDate: '2026-08-14',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Upload Large PDF', desc: 'Select your oversized PDF document in PDFSketch Compress.' },
      { step: 2, title: 'Choose Optimization Mode', desc: 'Select "Recommended Quality" for the optimal balance of size reduction and clarity.' },
      { step: 3, title: 'Download Compressed File', desc: 'Save your lightweight PDF ready for email sending.' }
    ],
    features: [
      { title: 'Smart Image Resampling', desc: 'Downsamples oversized photo assets while retaining legible DPI.' },
      { title: 'Font Subset Deduplication', desc: 'Removes redundant embedded font character sets.' },
      { title: 'Metadata Stripping', desc: 'Eliminates hidden edit histories and unnecessary binary headers.' }
    ],
    securityText: 'Ephemeral memory processing guarantees complete document safety.',
    faqs: [
      { question: 'Why is my PDF file so large?', answer: 'Large PDFs are usually caused by uncompressed high-DPI scans, duplicate embedded fonts, or high-res images.' },
      { question: 'What is the best compression setting for email?', answer: 'The Recommended profile creates files well below the 25MB email attachment limit.' }
    ],
    relatedToolIds: ['merge', 'pdftojpg', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'Compress PDF Guide', path: '/guides/how-to-compress-pdf-without-losing-quality/' }]
  },

  '/guides/how-to-convert-pdf-to-word/': {
    slug: 'how-to-convert-pdf-to-word',
    path: '/guides/how-to-convert-pdf-to-word/',
    toolId: 'pdftoword',
    title: 'How to Convert PDF to Word (DOCX) and Keep Formatting | PDFSketch',
    description: 'Learn how to transform PDF documents into editable Word files with accurate paragraph matching, tables, and OCR.',
    h1: 'How to Convert PDF to Word and Keep Formatting',
    subtitle: 'Transform read-only PDFs into editable Microsoft Word documents effortlessly.',
    quickAnswer: 'Upload your PDF to PDFSketch PDF to Word, let the AI layout engine map fonts and tables, and download an editable .docx file.',
    isGuide: true,
    author: 'Alex Morgan',
    publishedDate: '2026-08-15',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Select the PDF document you need to edit.' },
      { step: 2, title: 'Run Layout Analysis', desc: 'The converter reconstructs headers, bulleted lists, and tables.' },
      { step: 3, title: 'Export DOCX', desc: 'Download your editable Word document.' }
    ],
    features: [
      { title: 'Table Reconstruction', desc: 'Turns static PDF tables into native editable Word tables.' },
      { title: 'OCR for Scans', desc: 'Reads physical paper scans and outputs real text.' },
      { title: 'Google Docs Compatible', desc: 'Converted DOCX files open flawlessly in Microsoft Word and Google Docs.' }
    ],
    securityText: 'Encrypted transmission with zero permanent storage.',
    faqs: [
      { question: 'Can I edit the converted file in Google Docs?', answer: 'Yes! The downloaded .docx file can be uploaded and edited directly in Google Docs or Word.' },
      { question: 'Does it work with password-protected PDFs?', answer: 'You should unlock the PDF first before converting.' }
    ],
    relatedToolIds: ['wordpdf', 'ocr', 'edit'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'PDF to Word Guide', path: '/guides/how-to-convert-pdf-to-word/' }]
  },

  '/guides/how-to-sign-pdf-online/': {
    slug: 'how-to-sign-pdf-online',
    path: '/guides/how-to-sign-pdf-online/',
    toolId: 'sign',
    title: 'How to Sign a PDF Document Online for Free | PDFSketch',
    description: 'Step-by-step instructions on creating, placing, and saving legally binding electronic signatures on PDF contracts.',
    h1: 'How to Sign a PDF Document Online for Free',
    subtitle: 'Add legally valid electronic signatures and date stamps to contracts in seconds.',
    quickAnswer: 'Open PDFSketch Sign PDF, draw your signature or type your initials, place the stamp on the signature line, and download.',
    isGuide: true,
    author: 'Sarah Jenkins',
    publishedDate: '2026-08-16',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Upload Contract', desc: 'Select the PDF requiring your electronic signature.' },
      { step: 2, title: 'Create Signature', desc: 'Draw with touch or mouse, type in cursive font, or upload a photo of your signature.' },
      { step: 3, title: 'Position & Finalize', desc: 'Drag the signature onto the document and download the completed file.' }
    ],
    features: [
      { title: 'Touch-Screen Precision', desc: 'Sign smoothly on phones and tablets.' },
      { title: 'Multi-Signer Support', desc: 'Add initials, checkmarks, text fields, and dates.' },
      { title: 'Legally Valid Output', desc: 'Conforms to international electronic signature legislation.' }
    ],
    securityText: 'Signatures are baked into the PDF client-side without external exposure.',
    faqs: [
      { question: 'Is it legal to sign PDFs online?', answer: 'Yes, electronic signatures are legally binding in the US (ESIGN Act), EU (eIDAS), and worldwide.' },
      { question: 'Can I save my signature for next time?', answer: 'Yes, PDFSketch can remember your signature profile in your local browser storage.' }
    ],
    relatedToolIds: ['edit', 'protect', 'forms'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'Sign PDF Guide', path: '/guides/how-to-sign-pdf-online/' }]
  },

  '/guides/how-to-edit-pdf-free/': {
    slug: 'how-to-edit-pdf-free',
    path: '/guides/how-to-edit-pdf-free/',
    toolId: 'edit',
    title: 'How to Edit a PDF for Free Without Adobe Acrobat | PDFSketch',
    description: 'Learn how to add text, insert images, highlight paragraphs, draw shapes, and whiteout errors on any PDF for free.',
    h1: 'How to Edit a PDF for Free Without Adobe Acrobat',
    subtitle: 'Modify text, annotate documents, and add images without expensive subscription software.',
    quickAnswer: 'Use PDFSketch Edit PDF to add text boxes, highlights, drawings, and whiteout rectangles directly from your web browser.',
    isGuide: true,
    author: 'Alex Morgan',
    publishedDate: '2026-08-17',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Open PDF in Editor', desc: 'Upload your document to the PDFSketch Edit tool.' },
      { step: 2, title: 'Select Editing Tool', desc: 'Choose Text, Highlight, Draw, Shapes, or Whiteout from the toolbar.' },
      { step: 3, title: 'Apply Edits & Save', desc: 'Position your modifications and export your finalized PDF.' }
    ],
    features: [
      { title: 'Zero Subscription Costs', desc: '100% free alternative to expensive desktop software.' },
      { title: 'Interactive Canvas', desc: 'Move, resize, and colorize annotations with pixel precision.' },
      { title: 'No Watermarks', desc: 'Your exported documents remain clean and professional.' }
    ],
    securityText: 'In-browser canvas processing keeps your content private.',
    faqs: [
      { question: 'Can I whiteout mistakes in a PDF?', answer: 'Yes, use the whiteout/rectangle tool to cover incorrect text and type clean new text on top.' },
      { question: 'Can I insert images or logos?', answer: 'Yes, you can upload PNG and JPG images directly onto any PDF page.' }
    ],
    relatedToolIds: ['sign', 'redact', 'watermark'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'Edit PDF Guide', path: '/guides/how-to-edit-pdf-free/' }]
  },

  '/guides/how-to-protect-pdf-with-password/': {
    slug: 'how-to-protect-pdf-with-password',
    path: '/guides/how-to-protect-pdf-with-password/',
    toolId: 'protect',
    title: 'How to Password Protect a PDF File for Free | PDFSketch',
    description: 'Learn how to encrypt your PDF with strong AES passwords to protect financial, confidential, and personal data.',
    h1: 'How to Password Protect and Encrypt a PDF File',
    subtitle: 'Secure confidential documents against unauthorized viewing, printing, or copying.',
    quickAnswer: 'Upload your file to PDFSketch Protect PDF, enter a strong password, and download your AES-256 encrypted document.',
    isGuide: true,
    author: 'Sarah Jenkins',
    publishedDate: '2026-08-18',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Upload Document', desc: 'Select the sensitive PDF file.' },
      { step: 2, title: 'Enter Strong Passphrase', desc: 'Type your custom password with a mix of letters, numbers, and symbols.' },
      { step: 3, title: 'Download Encrypted File', desc: 'Save your secure PDF that requires the password to open.' }
    ],
    features: [
      { title: 'Military-Grade AES Encryption', desc: 'Compliant with enterprise and government security mandates.' },
      { title: 'Zero Password Retention', desc: 'Your passphrase is never logged or saved on any server.' },
      { title: 'Universal PDF Compatibility', desc: 'Opens on all standard PDF readers (Adobe, Apple Preview, Chrome).' }
    ],
    securityText: 'Cryptographically hardened AES encryption performed in memory.',
    faqs: [
      { question: 'How strong is AES-256 encryption?', answer: 'AES-256 is virtually unbreakable by brute force and is used by banks and governments.' },
      { question: 'What happens if I lose my password?', answer: 'Because we do not store passwords, make sure to keep a secure record of your password.' }
    ],
    relatedToolIds: ['unlock', 'redact', 'watermark'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'Password Protect Guide', path: '/guides/how-to-protect-pdf-with-password/' }]
  },

  '/guides/how-to-extract-text-ocr-pdf/': {
    slug: 'how-to-extract-text-ocr-pdf',
    path: '/guides/how-to-extract-text-ocr-pdf/',
    toolId: 'ocr',
    title: 'How to OCR Scanned PDFs and Extract Text Online | PDFSketch',
    description: 'Learn how to turn non-selectable scanned PDFs into searchable, editable text using optical character recognition.',
    h1: 'How to OCR Scanned PDFs and Extract Text Online',
    subtitle: 'Convert images and paper scans into copyable, searchable digital documents.',
    quickAnswer: 'Upload your scan to PDFSketch OCR PDF, select the document language, and download a searchable PDF or extracted text.',
    isGuide: true,
    author: 'Elena Rostova',
    publishedDate: '2026-08-19',
    lastmod: '2026-08-20',
    howTo: [
      { step: 1, title: 'Upload Scanned PDF', desc: 'Choose your document or image scan.' },
      { step: 2, title: 'Select Document Language', desc: 'Specify language to optimize recognition accuracy.' },
      { step: 3, title: 'Export Searchable PDF or Text', desc: 'Download your searchable PDF or copy plain text directly.' }
    ],
    features: [
      { title: 'High-Precision OCR Engine', desc: 'Extracts text from receipts, books, contracts, and invoices.' },
      { title: 'Searchable PDF Output', desc: 'Embeds an invisible selectable text layer under the original scan image.' },
      { title: 'Multi-Column Recognition', desc: 'Accurately parses newspapers, academic articles, and tables.' }
    ],
    securityText: 'Isolated OCR sandbox with immediate memory erasure.',
    faqs: [
      { question: 'Can OCR recognize handwritten text?', answer: 'Our OCR works best with printed text, but can recognize neat block handwriting.' },
      { question: 'How many languages are supported?', answer: 'Over 25 major languages including English, Spanish, German, French, Chinese, and Hindi.' }
    ],
    relatedToolIds: ['pdftoword', 'pdftoexcel', 'compress'],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: 'OCR PDF Guide', path: '/guides/how-to-extract-text-ocr-pdf/' }]
  }
};

// Helper record for compatibility with previous TOOL_SEO_CONFIG
export const TOOL_SEO_CONFIG: Record<string, ToolSeoData> = {};
Object.entries(routeConfigs).forEach(([_, config]) => {
  if (config.toolId && !config.isGuide && !config.isCommercial && config.slug) {
    TOOL_SEO_CONFIG[config.slug] = {
      slug: config.slug,
      title: config.title,
      metaDescription: config.description,
      h1: config.h1,
      keywords: [config.slug.replace(/-/g, ' '), `${config.slug.replace(/-/g, ' ')} online`, `${config.slug.replace(/-/g, ' ')} free`],
      canonical: `${SITE_DOMAIN}${config.path}`,
      relatedToolSlugs: config.relatedToolIds || [],
      howToSteps: config.howTo.map(h => ({ name: h.title, text: h.desc })),
      faqs: config.faqs.map(f => ({ question: f.question, answer: f.answer })),
      features: config.features.map(feat => ({ title: feat.title, description: feat.desc }))
    };
  }
});
