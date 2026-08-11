import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Tool } from '../types';
import { InteractivePdfEditor } from './InteractivePdfEditor';

interface ToolModalProps {
  tool: Tool;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setError] = useState<string | null>(null);
  
  // Custom options per tool
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

  const isMultiFile = tool.id === 'merge' || tool.id === 'jpgtopdf' || tool.id.startsWith('workflow-');

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
    if (files.length === 0) return;

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    if (isMultiFile) {
      files.forEach(f => formData.append('files', f));
    } else {
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
      } else if (tool.id === 'pdftoppt' || tool.id === 'pdf-to-ppt' || tool.id === 'pdf2ppt') {
        filename = `${tool.id}-result.pptx`;
      } else if (tool.id === 'pdftoword' || tool.id === 'pdf-to-word' || tool.id === 'pdf2word') {
        filename = `${tool.id}-result.doc`;
      } else if (tool.id === 'pdftoexcel' || tool.id === 'pdf-to-excel' || tool.id === 'pdf2excel') {
        filename = `${tool.id}-result.csv`;
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
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-1">{tool.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{tool.desc}</p>
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
                  onClick={() => { setStatus('idle'); setFiles([]); }}
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
              {/* File Dropzone */}
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
                  accept={
                    tool.id === 'jpgtopdf' 
                      ? 'image/*,.jpg,.jpeg,.png,.webp' 
                      : tool.id === 'wordpdf' 
                      ? '.doc,.docx,.txt,.html,text/plain' 
                      : '.pdf,application/pdf'
                  }
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
                  {tool.id === 'jpgtopdf' 
                    ? 'Supports JPG, PNG, WEBP images' 
                    : tool.id === 'wordpdf' 
                    ? 'Supports DOC, DOCX, TXT, HTML documents' 
                    : 'Supports PDF documents up to 50MB'}
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
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

              {/* Tool Specific Configurations */}
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Protection Password (Optional)</label>
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

              {tool.id === 'workflow-merge-numbers' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Index Position</label>
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

              {tool.id === 'workflow-rotate-crop' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp</label>
                      <input 
                        type="text" 
                        value={watermarkText} 
                        onChange={(e) => setWatermarkText(e.target.value)} 
                        placeholder="e.g. APPROVED"
                        className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>
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

              {tool.id === 'edit' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Text / Content Annotation
                    </label>
                    <textarea 
                      rows={2}
                      value={watermarkText} 
                      onChange={(e) => setWatermarkText(e.target.value)} 
                      placeholder="Type text to insert onto PDF page..."
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Font Family</label>
                      <select
                        value={editFontFamily}
                        onChange={(e) => setEditFontFamily(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      >
                        <option value="helvetica">Sans-Serif</option>
                        <option value="times">Serif (Times)</option>
                        <option value="courier">Monospace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Font Size</label>
                      <select
                        value={editFontSize}
                        onChange={(e) => setEditFontSize(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      >
                        <option value="12">12px (Small)</option>
                        <option value="16">16px (Normal)</option>
                        <option value="18">18px (Medium)</option>
                        <option value="24px">24px (Large)</option>
                        <option value="32">32px (Header)</option>
                        <option value="48">48px (Title)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Text Color</label>
                      <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl p-1 bg-white">
                        <input
                          type="color"
                          value={editTextColor}
                          onChange={(e) => setEditTextColor(e.target.value)}
                          className="w-6 h-6 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono font-medium uppercase text-slate-600 truncate">{editTextColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight</label>
                      <button
                        type="button"
                        onClick={() => setEditBold(!editBold)}
                        className={`w-full p-2 text-xs font-bold rounded-xl border transition-all ${
                          editBold
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Bold {editBold ? '✓' : ''}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Placement Position</label>
                    <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto bg-slate-100 p-2 rounded-2xl border border-slate-200/80">
                      {[
                        { id: 't-l', label: 'Top Left' },
                        { id: 't-c', label: 'Top Center' },
                        { id: 't-r', label: 'Top Right' },
                        { id: 'c-l', label: 'Mid Left' },
                        { id: 'c-c', label: 'Center' },
                        { id: 'c-r', label: 'Mid Right' },
                        { id: 'b-l', label: 'Bot Left' },
                        { id: 'b-c', label: 'Bot Center' },
                        { id: 'b-r', label: 'Bot Right' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPosition(p.id)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                            position === p.id
                              ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/60'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Pages</label>
                      <input 
                        type="text" 
                        value={pagesText} 
                        onChange={(e) => setPagesText(e.target.value)} 
                        placeholder="e.g. all, 1, 1-3"
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Optional Image / Signature Stamp
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => setStampFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {stampFile && (
                        <p className="text-[10px] text-indigo-600 mt-1 font-medium truncate">
                          ✓ Stamp: {stampFile.name}
                        </p>
                      )}
                    </div>
                  </div>
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
                disabled={files.length === 0 || status === 'uploading'}
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

