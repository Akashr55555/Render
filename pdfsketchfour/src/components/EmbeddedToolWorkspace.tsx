import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Tool } from '../types';
import { InteractivePdfEditor } from './InteractivePdfEditor';
import { useLanguage } from '../context/LanguageContext';
import { getToolTranslation } from '../i18n/toolTranslations';

interface EmbeddedToolWorkspaceProps {
  tool: Tool;
  onSuccess?: () => void;
}

export const EmbeddedToolWorkspace: React.FC<EmbeddedToolWorkspaceProps> = ({ tool, onSuccess }) => {
  const { currentLanguage, t } = useLanguage();
  const translatedTool = getToolTranslation(tool, currentLanguage.code);

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
  const [redactMode, setRedactMode] = useState<'blackout' | 'whiteout'>('blackout');
  const [redactQuery, setRedactQuery] = useState('');
  const [sanitizeMeta, setSanitizeMeta] = useState(true);

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
      formData.append('x', '50');
      formData.append('y', '100');
      formData.append('pageIndex', '0');
      formData.append('fontSize', editFontSize.toString());
      formData.append('textColor', editTextColor);
      formData.append('fontFamily', editFontFamily);
      formData.append('isBold', editBold ? 'true' : 'false');
      if (stampFile) {
        formData.append('stampImage', stampFile);
      }
    } else if (tool.id === 'watermark') {
      formData.append('text', watermarkText);
      formData.append('position', position);
      formData.append('opacity', '0.35');
    } else if (tool.id === 'protect') {
      formData.append('password', password);
    } else if (tool.id === 'unlock') {
      formData.append('password', password);
    } else if (tool.id === 'pagenumbers') {
      formData.append('position', position);
      formData.append('startFrom', '1');
    } else if (tool.id === 'crop') {
      formData.append('x', cropBox.x);
      formData.append('y', cropBox.y);
      formData.append('w', cropBox.w);
      formData.append('h', cropBox.h);
    } else if (tool.id === 'compress') {
      formData.append('level', compressLevel);
    } else if (tool.id === 'split') {
      formData.append('mode', splitMode);
      formData.append('pages', pagesText);
    } else if (tool.id === 'redact') {
      endpoint = '/api/redact';
      formData.append('mode', redactMode);
      if (redactQuery.trim()) {
        formData.append('redactText', redactQuery.trim());
      }
      formData.append('sanitizeMetadata', sanitizeMeta ? 'true' : 'false');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errStr = 'Processing failed.';
        try {
          const errJson = await response.json();
          errStr = errJson.error || errStr;
        } catch (_) {}
        throw new Error(errStr);
      }

      // Check content type to handle binary download vs text output
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonRes = await response.json();
        const textContent = jsonRes.summary || jsonRes.markdown || JSON.stringify(jsonRes, null, 2);
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = tool.id === 'pdftomd' ? '.md' : '.txt';
        a.download = `pdfsketch_${tool.id}_result${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let fileExt = '.pdf';
        if (tool.id === 'pdftojpg') fileExt = '.jpg';
        else if (tool.id === 'pdftopng') fileExt = '.png';
        else if (tool.id === 'pdftoword') fileExt = '.docx';
        else if (tool.id === 'pdftoexcel') fileExt = '.xlsx';
        else if (tool.id === 'pdftoppt') fileExt = '.pptx';
        else if (tool.id === 'pdftomd') fileExt = '.md';

        const headerDisp = response.headers.get('content-disposition');
        let filename = `pdfsketch_${tool.id}_processed${fileExt}`;
        if (headerDisp && headerDisp.includes('filename=')) {
          const match = headerDisp.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      setStatus('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'Error processing document. Please verify your file and options.');
    }
  };

  const resetState = () => {
    setFiles([]);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 max-w-2xl mx-auto my-6 text-left">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg font-heading">{translatedTool.title} Workspace</h3>
          <p className="text-xs text-slate-500">{translatedTool.desc}</p>
        </div>
      </div>

      {tool.id === 'edit' && files.length > 0 ? (
        <InteractivePdfEditor
          file={files[0]}
          onBack={resetState}
          fontSize={editFontSize}
          setFontSize={setEditFontSize}
          textColor={editTextColor}
          setTextColor={setEditTextColor}
          fontFamily={editFontFamily}
          setFontFamily={setEditFontFamily}
          isBold={editBold}
          setIsBold={setEditBold}
          stampFile={stampFile}
          setStampFile={setStampFile}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Dropzone */}
          {status === 'idle' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple={isMultiFile}
                accept={
                  tool.id === 'jpgtopdf'
                    ? 'image/*'
                    : tool.id === 'wordpdf'
                    ? '.doc,.docx,.txt,.html'
                    : '.pdf'
                }
                className="hidden"
              />
              <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-slate-200/80 flex items-center justify-center mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                {isMultiFile ? 'Drop your files here or click to select' : 'Drop your file here or click to select'}
              </p>
              <p className="text-xs text-slate-400">
                {tool.id === 'jpgtopdf'
                  ? 'Supports JPG, PNG, WEBP, GIF images'
                  : tool.id === 'wordpdf'
                  ? 'Supports DOC, DOCX, TXT, HTML documents'
                  : 'Supports PDF documents up to 50MB'}
              </p>
            </div>
          )}

          {/* Selected Files List */}
          {files.length > 0 && status === 'idle' && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={idx}
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
                </div>
              ))}
            </div>
          )}

          {/* Tool Options */}
          {files.length > 0 && status === 'idle' && (
            <div className="space-y-3">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Stamp Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL / DO NOT COPY"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>
              )}

              {tool.id === 'protect' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Set Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password..."
                    required
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>
              )}

              {tool.id === 'compress' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compression Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCompressLevel('low')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${compressLevel === 'low' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Low Compression
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel('medium')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${compressLevel === 'medium' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Recommended
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompressLevel('high')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${compressLevel === 'high' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Extreme
                    </button>
                  </div>
                </div>
              )}

              {tool.id === 'redact' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Redaction Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRedactMode('blackout')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${redactMode === 'blackout' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        <span className="w-3 h-3 bg-black rounded-xs inline-block"></span>
                        Solid Blackout
                      </button>
                      <button
                        type="button"
                        onClick={() => setRedactMode('whiteout')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${redactMode === 'whiteout' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        <span className="w-3 h-3 bg-white border border-slate-400 rounded-xs inline-block"></span>
                        Whiteout Erase
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Text Pattern to Auto-Redact (Optional)</label>
                    <input
                      type="text"
                      value={redactQuery}
                      onChange={(e) => setRedactQuery(e.target.value)}
                      placeholder="e.g. SSN, Account #, confidential text..."
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Leaves document completely sanitized with unrecoverable pixel-burned redaction.</p>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sanitizeMeta}
                      onChange={(e) => setSanitizeMeta(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700">Sanitize hidden PDF metadata, author, and creator tags</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Uploading Progress */}
          {status === 'uploading' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">Processing document...</p>
              <p className="text-xs text-slate-500">Applying end-to-end encrypted transformations.</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="py-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 p-4">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-base">Processing Complete!</h4>
              <p className="text-xs text-emerald-700">Your processed file has been downloaded automatically.</p>
              <button
                type="button"
                onClick={resetState}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Process Another Document
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="py-4 px-4 bg-rose-50 rounded-2xl border border-rose-200/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900 mb-0.5">Failed to Process Document</p>
                <p className="text-xs text-rose-700 mb-2">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-xs font-bold text-rose-800 underline hover:text-rose-950"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          {status === 'idle' && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={files.length === 0}
                className="w-full py-3.5 px-6 bg-[#009b8d] hover:bg-[#00867a] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Process Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
