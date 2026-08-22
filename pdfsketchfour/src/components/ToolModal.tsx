import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileText,
  Sparkles,
  PenTool,
  Globe,
  Archive,
  Camera,
  GitCompare,
  CheckSquare,
  Languages,
  Plus,
  Trash2
} from 'lucide-react';
import { Tool } from '../types';
import { InteractivePdfEditor } from './InteractivePdfEditor';
import { useLanguage } from '../context/LanguageContext';
import { getToolTranslation } from '../i18n/toolTranslations';

interface ToolModalProps {
  tool: Tool;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const { currentLanguage } = useLanguage();
  const translatedTool = getToolTranslation(tool, currentLanguage.code);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [file2, setFile2] = useState<File | null>(null); // For Compare tool
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setError] = useState<string | null>(null);

  // General options
  const [deg, setDeg] = useState<'90' | '180' | '270'>('90');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [password, setPassword] = useState('');
  const [pagesText, setPagesText] = useState('all');
  const [position, setPosition] = useState('t-c');
  const [compressLevel, setCompressLevel] = useState<'medium' | 'high' | 'low'>('medium');
  const [splitMode, setSplitMode] = useState<'single' | 'every' | 'ranges'>('single');
  const [cropBox, setCropBox] = useState({ x: '50', y: '50', w: '400', h: '600' });

  // PDF Edit state
  const [editFontSize, setEditFontSize] = useState<number>(18);
  const [editTextColor, setEditTextColor] = useState<string>('#1e293b');
  const [editFontFamily, setEditFontFamily] = useState<string>('helvetica');
  const [editBold, setEditBold] = useState<boolean>(false);
  const [stampFile, setStampFile] = useState<File | null>(null);

  // New Tool Specific States
  // 1. Sign
  const [signerName, setSignerName] = useState('John Doe');
  const [signerRole, setSignerRole] = useState('Authorized Signatory');
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);
  const [signPageNum, setSignPageNum] = useState('1');
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'stamp'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSig, setHasDrawnSig] = useState(false);

  // 2. HTML to PDF
  const [htmlUrl, setHtmlUrl] = useState('');
  const [htmlOrientation, setHtmlOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // 3. PDF/A
  const [pdfaStandard, setPdfaStandard] = useState<'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b'>('PDF/A-1b');

  // 4. Forms
  const [formFlatten, setFormFlatten] = useState(false);
  const [formAutoTemplate, setFormAutoTemplate] = useState(true);
  const [customFormFields, setCustomFormFields] = useState<Array<{ name: string; type: 'text' | 'checkbox' | 'dropdown'; value: string }>>([
    { name: 'Full Name', type: 'text', value: 'Jane Doe' },
    { name: 'Email Address', type: 'text', value: 'jane@example.com' },
    { name: 'I agree to the terms', type: 'checkbox', value: 'true' },
  ]);

  // 5. Translate
  const [targetLang, setTargetLang] = useState('es');

  // 6. Scan
  const [scanFilter, setScanFilter] = useState<'enhance' | 'bw' | 'grayscale' | 'original'>('enhance');

  const isMultiFile = tool.id === 'merge' || tool.id === 'jpgtopdf' || tool.id === 'scan' || tool.id.startsWith('workflow-');

  // Setup drawing canvas for signature
  useEffect(() => {
    if (tool.id === 'sign' && signatureType === 'draw' && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tool.id, signatureType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawnSig(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawnSig(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (isMultiFile) {
        setFiles(prev => [...prev, ...selected]);
      } else {
        setFiles(selected.slice(0, 1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files);
      if (isMultiFile) {
        setFiles(prev => [...prev, ...dropped]);
      } else {
        setFiles(dropped.slice(0, 1));
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check prerequisites
    if (tool.id === 'htmltopdf' && !htmlUrl.trim() && files.length === 0) {
      setError('Please enter a website URL or select an HTML file to convert.');
      return;
    }
    if (tool.id === 'compare' && (!files[0] || !file2)) {
      setError('Please select both File 1 and File 2 to compare.');
      return;
    }
    if (tool.id !== 'htmltopdf' && files.length === 0) {
      setError('Please select at least one document to process.');
      return;
    }

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    if (tool.id === 'compare') {
      if (files[0]) formData.append('files', files[0]);
      if (file2) formData.append('files', file2);
    } else if (isMultiFile) {
      files.forEach(f => formData.append('files', f));
    } else if (files.length > 0) {
      formData.append('file', files[0]);
    }

    let endpoint = `/api/${tool.id}`;

    // Custom option mapping
    if (tool.id.startsWith('workflow-')) {
      endpoint = '/api/workflow';
      formData.append('workflowType', tool.id.replace('workflow-', ''));
      formData.append('watermarkText', watermarkText || 'CONFIDENTIAL');
      formData.append('password', password);
      formData.append('deg', deg);
      formData.append('cropW', cropBox.w.toString());
      formData.append('cropH', cropBox.h.toString());
      formData.append('pageNumbersPosition', position);
      formData.append('doMerge', files.length > 1 ? 'true' : 'false');
    } else if (tool.id === 'sign') {
      endpoint = '/api/sign';
      formData.append('signerName', signerName);
      formData.append('signerRole', signerRole);
      formData.append('signDate', signDate);
      formData.append('pageNumber', signPageNum);
      formData.append('signatureType', signatureType);
      if (signatureType === 'draw' && sigCanvasRef.current && hasDrawnSig) {
        formData.append('signatureDataUrl', sigCanvasRef.current.toDataURL('image/png'));
      }
    } else if (tool.id === 'htmltopdf') {
      endpoint = '/api/htmltopdf';
      if (htmlUrl.trim()) formData.append('url', htmlUrl.trim());
      formData.append('orientation', htmlOrientation);
    } else if (tool.id === 'pdftopdfa') {
      endpoint = '/api/pdftopdfa';
      formData.append('standard', pdfaStandard);
    } else if (tool.id === 'compare') {
      endpoint = '/api/compare';
    } else if (tool.id === 'forms') {
      endpoint = '/api/forms';
      formData.append('flatten', formFlatten ? 'true' : 'false');
      formData.append('autoCreateTemplate', formAutoTemplate ? 'true' : 'false');
      const fieldValues: Record<string, string> = {};
      customFormFields.forEach(f => {
        fieldValues[f.name] = f.value;
      });
      formData.append('fieldValues', JSON.stringify(fieldValues));
    } else if (tool.id === 'translate') {
      endpoint = '/api/translate';
      formData.append('targetLanguage', targetLang);
    } else if (tool.id === 'scan') {
      endpoint = '/api/scan';
      formData.append('filter', scanFilter);
    } else if (tool.id === 'rotate') {
      formData.append('deg', deg);
      formData.append('pages', pagesText);
    } else if (tool.id === 'edit') {
      formData.append('text', watermarkText || 'PDFSketch Annotation');
      formData.append('fontSize', editFontSize.toString());
      formData.append('color', editTextColor);
      formData.append('fontFamily', editFontFamily);
      formData.append('bold', editBold ? 'true' : 'false');
      formData.append('position', position);
      formData.append('pages', pagesText);
      if (stampFile) {
        formData.append('image', stampFile);
      }
    } else if (tool.id === 'watermark') {
      formData.append('text', watermarkText || 'CONFIDENTIAL');
    } else if (tool.id === 'protect') {
      formData.append('userPassword', password);
    } else if (tool.id === 'pagenumbers') {
      formData.append('position', position);
    } else if (tool.id === 'split') {
      formData.append('mode', splitMode);
      if (splitMode === 'ranges') formData.append('ranges', pagesText);
    } else if (tool.id === 'crop') {
      formData.append('x', cropBox.x.toString());
      formData.append('y', cropBox.y.toString());
      formData.append('w', cropBox.w.toString());
      formData.append('h', cropBox.h.toString());
      formData.append('pages', pagesText);
    } else if (tool.id === 'extract-pages' || tool.id === 'organize') {
      formData.append('pages', pagesText || '1');
    } else if (tool.id === 'compress') {
      formData.append('level', compressLevel);
    } else if (tool.id === 'redact') {
      endpoint = '/api/redact';
      formData.append('mode', 'blackout');
    } else if (tool.id === 'pdftopng') {
      endpoint = '/api/pdf-to-png';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (!response.ok || contentType.includes('application/json')) {
        const resJson = await response.json().catch(() => ({}));
        throw new Error(resJson.error || resJson.hint || `Operation failed (${response.status})`);
      }

      // Handle binary response download
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received an empty file from server. Please verify your input document.');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'processed-document';
      if (contentDisposition) {
        const matchUtf8 = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
        const matchStandard = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (matchUtf8 && matchUtf8[1]) {
          filename = decodeURIComponent(matchUtf8[1]);
        } else if (matchStandard && matchStandard[1]) {
          filename = decodeURIComponent(matchStandard[1]);
        }
      } else if (blob.type === 'application/zip') {
        filename = `${tool.id}-result.zip`;
      } else if (tool.id === 'pdftoppt' || tool.id === 'pdf-to-ppt') {
        filename = `${tool.id}-result.pptx`;
      } else if (tool.id === 'pdftoword' || tool.id === 'pdf-to-word') {
        filename = `${tool.id}-result.docx`;
      } else if (tool.id === 'pdftoexcel' || tool.id === 'pdf-to-excel') {
        filename = `${tool.id}-result.xlsx`;
      } else {
        filename = `${tool.id}-result.pdf`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'An unexpected error occurred during processing.');
    }
  };

  if (tool.id === 'edit' && files.length > 0) {
    return <InteractivePdfEditor file={files[0]} onClose={onClose} />;
  }

  // Accepted file types configuration
  const getAcceptedFileTypes = () => {
    if (tool.id === 'jpgtopdf' || tool.id === 'scan') return 'image/*,.jpg,.jpeg,.png,.webp';
    if (tool.id === 'wordpdf') return '.doc,.docx,.txt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (tool.id === 'ppttopdf') return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
    if (tool.id === 'exceltopdf') return '.xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (tool.id === 'htmltopdf') return '.html,.htm,text/html';
    return '.pdf,application/pdf';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 z-10 my-auto max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="sticky top-0 float-right z-20 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors bg-white/90 backdrop-blur-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 pr-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              PDF Tool
            </span>
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-1">{translatedTool.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{translatedTool.desc}</p>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Processing Complete!</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Your output document has been processed and saved directly to your device.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setStatus('idle'); setFiles([]); setFile2(null); }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Process Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Specialized HTML to PDF URL Bar */}
              {tool.id === 'htmltopdf' && (
                <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-900">
                    <Globe className="w-4 h-4 inline mr-1 text-indigo-600" />
                    Enter Webpage URL to Convert
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={htmlUrl}
                      onChange={(e) => setHtmlUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <span>Orientation:</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="htmlOrientation"
                        checked={htmlOrientation === 'portrait'}
                        onChange={() => setHtmlOrientation('portrait')}
                        className="text-indigo-600"
                      />
                      Portrait (A4)
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="htmlOrientation"
                        checked={htmlOrientation === 'landscape'}
                        onChange={() => setHtmlOrientation('landscape')}
                        className="text-indigo-600"
                      />
                      Landscape (Wide)
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
                    — OR Upload an .HTML / .HTM file below —
                  </div>
                </div>
              )}

              {/* Specialized Compare PDF: Two dropzones */}
              {tool.id === 'compare' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File 1 */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all rounded-2xl p-5 text-center cursor-pointer relative group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => e.target.files?.[0] && setFiles([e.target.files[0]])}
                      className="hidden"
                    />
                    <div className="w-10 h-10 bg-white rounded-xl text-indigo-600 shadow-sm flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Original Document (File 1)</p>
                    {files[0] ? (
                      <p className="text-[11px] text-indigo-600 font-semibold mt-1 truncate">{files[0].name}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">Click to select PDF 1</p>
                    )}
                  </div>

                  {/* File 2 */}
                  <div
                    onClick={() => fileInputRef2.current?.click()}
                    className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/80 transition-all rounded-2xl p-5 text-center cursor-pointer relative group"
                  >
                    <input
                      ref={fileInputRef2}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => e.target.files?.[0] && setFile2(e.target.files[0])}
                      className="hidden"
                    />
                    <div className="w-10 h-10 bg-white rounded-xl text-purple-600 shadow-sm flex items-center justify-center mx-auto mb-2">
                      <GitCompare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Revised Document (File 2)</p>
                    {file2 ? (
                      <p className="text-[11px] text-purple-600 font-semibold mt-1 truncate">{file2.name}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">Click to select PDF 2</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard File Dropzone */
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all rounded-2xl p-7 text-center cursor-pointer relative group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={isMultiFile}
                    onChange={handleFileChange}
                    accept={getAcceptedFileTypes()}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-12 h-12 bg-white rounded-xl text-indigo-600 shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform relative z-10 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700"
                    title="Click to select or drop file"
                  >
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Select or drop {isMultiFile ? 'multiple files' : 'your file'} here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {tool.id === 'jpgtopdf' || tool.id === 'scan'
                      ? 'Supports JPG, PNG, WEBP images' 
                      : tool.id === 'wordpdf' 
                      ? 'Supports DOC, DOCX, TXT documents' 
                      : tool.id === 'ppttopdf'
                      ? 'Supports PPT, PPTX presentation decks'
                      : tool.id === 'exceltopdf'
                      ? 'Supports XLS, XLSX, CSV spreadsheets'
                      : 'Supports PDF documents up to 50MB'}
                  </p>
                </div>
              )}

              {/* Selected Files List */}
              {files.length > 0 && tool.id !== 'compare' && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm border border-slate-200/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* TOOL SPECIFIC CONFIGURATION PANELS */}

              {/* 1. Sign Tool */}
              {tool.id === 'sign' && (
                <div className="space-y-4 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                    <PenTool className="w-4 h-4" /> Digital Signature Configuration
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignatureType('draw')}
                      className={`p-2 text-xs font-bold rounded-xl border transition-all ${
                        signatureType === 'draw'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureType('type')}
                      className={`p-2 text-xs font-bold rounded-xl border transition-all ${
                        signatureType === 'type'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Type Name
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureType('stamp')}
                      className={`p-2 text-xs font-bold rounded-xl border transition-all ${
                        signatureType === 'stamp'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Upload Stamp
                    </button>
                  </div>

                  {signatureType === 'draw' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">Draw with Mouse / Finger</label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                        >
                          Clear Canvas
                        </button>
                      </div>
                      <canvas
                        ref={sigCanvasRef}
                        width={460}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 bg-white border border-slate-300 rounded-xl cursor-crosshair shadow-inner"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Signer Full Name</label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Signer Title / Role</label>
                      <input
                        type="text"
                        value={signerRole}
                        onChange={(e) => setSignerRole(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Signing Date</label>
                      <input
                        type="date"
                        value={signDate}
                        onChange={(e) => setSignDate(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Page #</label>
                      <input
                        type="number"
                        min="1"
                        value={signPageNum}
                        onChange={(e) => setSignPageNum(e.target.value)}
                        placeholder="e.g. 1 (First page) or last"
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PDF/A Archiving Tool */}
              {tool.id === 'pdftopdfa' && (
                <div className="space-y-3 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                    <Archive className="w-4 h-4" /> ISO-Standardized Archival Format
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Standard</label>
                    <select
                      value={pdfaStandard}
                      onChange={(e: any) => setPdfaStandard(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                      <option value="PDF/A-1b">PDF/A-1b (ISO 19005-1: Basic Visual Conformance - Standard)</option>
                      <option value="PDF/A-2b">PDF/A-2b (ISO 19005-2: JPEG2000 & Transparency)</option>
                      <option value="PDF/A-3b">PDF/A-3b (ISO 19005-3: XML / Invoice Data Attachments)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Injects standard XMP metadata, Color Profiles, and strict compliance headers ensuring your document will render accurately decades from now.
                  </p>
                </div>
              )}

              {/* 3. PDF Forms Tool */}
              {tool.id === 'forms' && (
                <div className="space-y-3 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                      <CheckSquare className="w-4 h-4" /> Interactive PDF Forms Engine
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Form Field Values & Generator</label>
                    {customFormFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const updated = [...customFormFields];
                            updated[idx].name = e.target.value;
                            setCustomFormFields(updated);
                          }}
                          placeholder="Field name"
                          className="w-1/3 p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const updated = [...customFormFields];
                            updated[idx].value = e.target.value;
                            setCustomFormFields(updated);
                          }}
                          placeholder="Value"
                          className="w-2/3 p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomFormFields(customFormFields.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomFormFields([...customFormFields, { name: `Field_${customFormFields.length + 1}`, type: 'text', value: '' }])}
                      className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Field
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFlatten}
                        onChange={(e) => setFormFlatten(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      Flatten Form (Make values permanent & non-editable)
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTemplate}
                        onChange={(e) => setFormAutoTemplate(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      Automatically inject fillable fields if document is a plain PDF
                    </label>
                  </div>
                </div>
              )}

              {/* 4. Translate Tool */}
              {tool.id === 'translate' && (
                <div className="space-y-3 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                    <Languages className="w-4 h-4" /> AI Document Translator
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Language</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                    >
                      <option value="es">Spanish (Español)</option>
                      <option value="fr">French (Français)</option>
                      <option value="de">German (Deutsch)</option>
                      <option value="it">Italian (Italiano)</option>
                      <option value="pt">Portuguese (Português)</option>
                      <option value="zh">Simplified Chinese (中文)</option>
                      <option value="ja">Japanese (日本語)</option>
                      <option value="ko">Korean (한국어)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="ar">Arabic (العربية)</option>
                      <option value="ru">Russian (Русский)</option>
                      <option value="nl">Dutch (Nederlands)</option>
                      <option value="pl">Polish (Polski)</option>
                      <option value="en">English (US/UK)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Extracts document typography, paragraphs, headers, and bullet points, accurately translating the entire text while preserving original page structure.
                  </p>
                </div>
              )}

              {/* 5. Scan Tool */}
              {tool.id === 'scan' && (
                <div className="space-y-3 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
                    <Camera className="w-4 h-4" /> Document Scanner & Optimizer
                  </div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scan Enhancement Filter</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'enhance', label: 'Magic Color', desc: 'Enhanced contrast' },
                      { id: 'bw', label: 'B&W Document', desc: 'Clean threshold' },
                      { id: 'grayscale', label: 'Grayscale', desc: 'Smooth gray' },
                      { id: 'original', label: 'Original', desc: 'No filter' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setScanFilter(f.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          scanFilter === f.id
                            ? 'border-red-600 bg-red-50 text-red-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <div className="text-xs font-bold">{f.label}</div>
                        <div className="text-[10px] text-slate-400">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Tools Configurations */}
              {tool.id === 'workflow-custom' && (
                <div className="space-y-3 pt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Pipeline Actions Settings
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp</label>
                      <input 
                        type="text" 
                        value={watermarkText} 
                        onChange={(e) => setWatermarkText(e.target.value)} 
                        placeholder="e.g. CONFIDENTIAL"
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Rotation Angle</label>
                      <select 
                        value={deg} 
                        onChange={(e: any) => setDeg(e.target.value)}
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      >
                        <option value="0">0° (None)</option>
                        <option value="90">90° Clockwise</option>
                        <option value="180">180° Flip</option>
                        <option value="270">270° Counter-Clockwise</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Page Numbers</label>
                      <select 
                        value={position} 
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      >
                        <option value="b-c">Bottom Center</option>
                        <option value="b-l">Bottom Left</option>
                        <option value="b-r">Bottom Right</option>
                        <option value="t-c">Top Center</option>
                        <option value="t-r">Top Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Protection Password</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Set password..."
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tool.id === 'workflow-watermark-protect' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp Text</label>
                    <input 
                      type="text" 
                      value={watermarkText} 
                      onChange={(e) => setWatermarkText(e.target.value)} 
                      placeholder="e.g. CONFIDENTIAL / DO NOT COPY"
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Encryption Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter security password..."
                      required
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              )}

              {tool.id === 'rotate' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rotation Angle</label>
                    <select 
                      value={deg} 
                      onChange={(e: any) => setDeg(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    >
                      <option value="90">90° Clockwise</option>
                      <option value="180">180° Flip</option>
                      <option value="270">270° Counter-Clockwise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Pages</label>
                    <input 
                      type="text" 
                      value={pagesText} 
                      onChange={(e) => setPagesText(e.target.value)} 
                      placeholder="e.g. all, 1-3, 5"
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              )}

              {tool.id === 'watermark' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Watermark Stamp Text
                  </label>
                  <input 
                    type="text" 
                    value={watermarkText} 
                    onChange={(e) => setWatermarkText(e.target.value)} 
                    placeholder="Enter watermark text (e.g. CONFIDENTIAL)..."
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>
              )}

              {(tool.id === 'organize' || tool.id === 'extract-pages') && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pages to Keep / Extract</label>
                  <input 
                    type="text" 
                    value={pagesText} 
                    onChange={(e) => setPagesText(e.target.value)} 
                    placeholder="e.g. 1, 3, 2 or 1-3"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>
              )}

              {tool.id === 'crop' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Width (px)</label>
                      <input 
                        type="number" 
                        value={cropBox.w} 
                        onChange={(e) => setCropBox({ ...cropBox, w: e.target.value })} 
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Height (px)</label>
                      <input 
                        type="number" 
                        value={cropBox.h} 
                        onChange={(e) => setCropBox({ ...cropBox, h: e.target.value })} 
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Pages</label>
                    <input 
                      type="text" 
                      value={pagesText} 
                      onChange={(e) => setPagesText(e.target.value)} 
                      placeholder="e.g. all or 1,2"
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              )}

              {tool.id === 'protect' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Protection Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter document password..."
                    required
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>
              )}

              {tool.id === 'pagenumbers' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Number Alignment</label>
                  <select 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="b-c">Bottom Center</option>
                    <option value="b-l">Bottom Left</option>
                    <option value="b-r">Bottom Right</option>
                    <option value="t-c">Top Center</option>
                    <option value="t-r">Top Right</option>
                  </select>
                </div>
              )}

              {tool.id === 'split' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Split Strategy</label>
                    <select 
                      value={splitMode} 
                      onChange={(e: any) => setSplitMode(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    >
                      <option value="single">Extract each page as an individual PDF</option>
                      <option value="ranges">Extract specific page ranges</option>
                    </select>
                  </div>
                  {splitMode === 'ranges' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Page Ranges</label>
                      <input 
                        type="text" 
                        value={pagesText} 
                        onChange={(e) => setPagesText(e.target.value)} 
                        placeholder="e.g. 1-2, 3-5, 6-"
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
                  )}
                </div>
              )}

              {tool.id === 'compress' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compression Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCompressLevel('high')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        compressLevel === 'high'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold mb-0.5">Extreme</div>
                      <div className="text-[10px] text-slate-500">Maximum compression</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel('medium')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        compressLevel === 'medium'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold mb-0.5">Recommended</div>
                      <div className="text-[10px] text-slate-500">Good balance</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel('low')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        compressLevel === 'low'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold mb-0.5">Less</div>
                      <div className="text-[10px] text-slate-500">High quality</div>
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={(tool.id !== 'htmltopdf' && files.length === 0) || (tool.id === 'htmltopdf' && !htmlUrl.trim() && files.length === 0) || status === 'uploading'}
                className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-cyan-600 hover:from-teal-800 hover:to-cyan-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {status === 'uploading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <span>Execute {tool.title}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
