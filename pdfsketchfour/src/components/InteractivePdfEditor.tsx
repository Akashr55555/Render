import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Type, Square, Circle, Minus, ArrowRight, Image as ImageIcon, 
  Highlighter, PenTool, Edit3, Trash2, RotateCw, ZoomIn, ZoomOut, 
  Maximize2, Check, Download, AlignLeft, AlignCenter, AlignRight, 
  Bold, Italic, Underline, Lock, Shield, Layers, Plus, Hand, Sparkles, CheckSquare, RefreshCw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set pdfjs worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

export interface EditElement {
  id: string;
  type: 'text' | 'shape' | 'drawing' | 'image';
  pageIndex: number;
  xPct: number;
  yPct: number;
  widthPct?: number;
  heightPct?: number;
  // Text attributes
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bgColor?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  // Shape attributes
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow';
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  // Drawing attributes
  points?: Array<{ xPct: number; yPct: number }>;
  opacity?: number;
  // Image attributes
  dataUrl?: string;
}

interface InteractivePdfEditorProps {
  file: File;
  onClose: () => void;
}

export const InteractivePdfEditor: React.FC<InteractivePdfEditorProps> = ({ file, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Tools & modes
  const [activeTab, setActiveTab] = useState<'annotate' | 'edit' | 'shapes' | 'insert' | 'editText' | 'forms'>('editText');
  const [toolMode, setToolMode] = useState<'select' | 'text' | 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'image'>('text');
  
  // Element selections and attributes
  const [elements, setElements] = useState<EditElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletedPages, setDeletedPages] = useState<number[]>([]);

  // Style state for selected or new elements
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>('helvetica');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [color, setColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Zoom
  const [zoom, setZoom] = useState<number>(100);

  // Canvas drawing ref
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentPathRef = useRef<Array<{ xPct: number; yPct: number }>>([]);

  // Load PDF document on start
  useEffect(() => {
    let isSubscribed = true;
    const loadPdfFile = async () => {
      setLoadingPdf(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (!isSubscribed) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);

        // Render page thumbnails
        const renderedThumbs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
            renderedThumbs.push(canvas.toDataURL('image/png'));
          }
        }
        if (isSubscribed) {
          setPageImages(renderedThumbs);
        }
      } catch (err) {
        console.error('Failed to parse PDF visually:', err);
      } finally {
        if (isSubscribed) setLoadingPdf(false);
      }
    };

    loadPdfFile();
    return () => { isSubscribed = false; };
  }, [file]);

  // Handle canvas clicks or drags for placing elements
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    if (toolMode === 'pen' || toolMode === 'highlighter') {
      isDrawingRef.current = true;
      currentPathRef.current = [{ xPct, yPct }];
    } else if (toolMode === 'text') {
      const newEl: EditElement = {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'text',
        pageIndex: currentPage,
        xPct,
        yPct,
        text: 'Click to edit text...',
        fontSize,
        fontFamily,
        color,
        bgColor,
        bold: isBold,
        italic: isItalic,
        align: textAlign,
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    } else if (toolMode === 'rectangle' || toolMode === 'circle' || toolMode === 'line' || toolMode === 'arrow') {
      const newEl: EditElement = {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'shape',
        pageIndex: currentPage,
        xPct,
        yPct,
        widthPct: 20,
        heightPct: 15,
        shapeType: toolMode,
        strokeColor: color,
        fillColor: bgColor === 'transparent' ? undefined : bgColor,
        strokeWidth,
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    currentPathRef.current.push({ xPct, yPct });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingRef.current && currentPathRef.current.length > 1) {
      const newEl: EditElement = {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'drawing',
        pageIndex: currentPage,
        xPct: currentPathRef.current[0].xPct,
        yPct: currentPathRef.current[0].yPct,
        points: [...currentPathRef.current],
        strokeColor: color,
        strokeWidth: toolMode === 'highlighter' ? 12 : strokeWidth,
        opacity: toolMode === 'highlighter' ? 0.4 : 1.0,
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    }
    isDrawingRef.current = false;
    currentPathRef.current = [];
  };

  // Image Upload handler for Insert mode
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const newEl: EditElement = {
        id: 'el_' + Date.now(),
        type: 'image',
        pageIndex: currentPage,
        xPct: 35,
        yPct: 35,
        widthPct: 25,
        heightPct: 20,
        dataUrl,
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    };
    reader.readAsDataURL(imgFile);
  };

  // Update selected element property
  const updateSelectedElement = (updates: Partial<EditElement>) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  // Save changes handler
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('elements', JSON.stringify(elements));
      formData.append('deletedPages', JSON.stringify(deletedPages));

      const res = await fetch('/api/edit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to save edited PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      alert('Error saving PDF changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col h-screen w-screen overflow-hidden text-slate-800">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs shrink-0 z-20">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => { setActiveTab('annotate'); setToolMode('pen'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'annotate' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Annotate</span>
          </button>

          <button
            onClick={() => { setActiveTab('edit'); setToolMode('text'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'edit' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Edit</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded-sm">PRO</span>
          </button>

          <button
            onClick={() => { setActiveTab('shapes'); setToolMode('rectangle'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'shapes' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Shapes</span>
          </button>

          <button
            onClick={() => { setActiveTab('insert'); setToolMode('image'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'insert' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Insert</span>
          </button>

          <button
            onClick={() => { setActiveTab('editText'); setToolMode('text'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'editText' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-indigo-900">Edit Text</span>
          </button>
        </div>

        {/* Mode Selector Buttons */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setToolMode('select')}
            title="Hand / Select Mode"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'select' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>

          <button
            onClick={() => setToolMode('text')}
            title="Add Text"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'text' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setToolMode('pen')}
            title="Freehand Pen"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'pen' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => setToolMode('highlighter')}
            title="Highlighter"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'highlighter' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => setToolMode('rectangle')}
            title="Rectangle"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'rectangle' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setToolMode('circle')}
            title="Circle"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'circle' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>

        {/* Exit modal */}
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* 2. MAIN EDITOR WORKSPACE (3 Columns: Thumbnails | Canvas | Properties Inspector) */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-200">

        {/* LEFT PANEL: PAGE THUMBNAILS */}
        <aside className="w-48 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-xs hidden sm:flex">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pages ({numPages})</span>
            <button 
              onClick={() => {
                if (numPages > 1) {
                  setDeletedPages(prev => [...prev, currentPage]);
                }
              }}
              disabled={numPages <= 1}
              className="p-1 text-slate-400 hover:text-red-600 transition-all rounded-md hover:bg-red-50 disabled:opacity-30"
              title="Delete page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pageImages.map((img, idx) => {
              if (deletedPages.includes(idx)) return null;
              const isSelected = currentPage === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`group relative cursor-pointer rounded-xl p-1.5 transition-all border ${
                    isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
                    {elements.filter(el => el.pageIndex === idx).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="mt-1 text-center text-[11px] font-bold text-slate-600">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER PANEL: INTERACTIVE CANVAS */}
        <main className="flex-1 overflow-auto flex flex-col items-center justify-start p-6 relative">
          
          {loadingPdf ? (
            <div className="my-auto flex flex-col items-center justify-center text-slate-500 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Loading PDF pages for editing...</p>
            </div>
          ) : (
            <div 
              className="relative shadow-2xl rounded-sm bg-white transition-all transform origin-top my-auto"
              style={{
                width: `${(612 * zoom) / 100}px`,
                height: `${(792 * zoom) / 100}px`,
              }}
            >
              {/* Background Page Image */}
              {pageImages[currentPage] && (
                <img 
                  src={pageImages[currentPage]} 
                  alt={`Page ${currentPage + 1}`} 
                  className="w-full h-full object-contain select-none pointer-events-none" 
                />
              )}

              {/* Interactive Draw & Annotation Layer */}
              <div
                ref={pageContainerRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className={`absolute inset-0 z-10 ${
                  toolMode === 'text' ? 'cursor-text' : toolMode === 'pen' || toolMode === 'highlighter' ? 'cursor-crosshair' : 'cursor-default'
                }`}
              >
                {/* Render Placed Elements */}
                {elements.filter(el => el.pageIndex === currentPage).map(el => {
                  const isSelected = selectedId === el.id;

                  if (el.type === 'text') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                        className={`absolute cursor-move p-1 rounded-md transition-all ${
                          isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/30 shadow-xs' : 'hover:ring-1 hover:ring-slate-400'
                        }`}
                        style={{
                          left: `${el.xPct}%`,
                          top: `${el.yPct}%`,
                        }}
                      >
                        <input
                          type="text"
                          value={el.text || ''}
                          onChange={(e) => updateSelectedElement({ text: e.target.value })}
                          className="bg-transparent outline-none border-none font-medium min-w-[60px]"
                          style={{
                            fontSize: `${el.fontSize || 16}px`,
                            color: el.color || '#000000',
                            fontWeight: el.bold ? 'bold' : 'normal',
                            fontStyle: el.italic ? 'italic' : 'normal',
                            fontFamily: el.fontFamily === 'times' ? 'serif' : el.fontFamily === 'courier' ? 'monospace' : 'sans-serif',
                            backgroundColor: el.bgColor || 'transparent',
                            textAlign: el.align || 'left',
                          }}
                        />
                      </div>
                    );
                  }

                  if (el.type === 'shape') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                        style={{
                          left: `${el.xPct}%`,
                          top: `${el.yPct}%`,
                          width: `${el.widthPct}%`,
                          height: `${el.heightPct}%`,
                          border: `${el.strokeWidth || 2}px solid ${el.strokeColor || '#3b82f6'}`,
                          borderRadius: el.shapeType === 'circle' ? '50%' : '4px',
                          backgroundColor: el.fillColor || 'transparent',
                        }}
                      />
                    );
                  }

                  if (el.type === 'image' && el.dataUrl) {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                        style={{
                          left: `${el.xPct}%`,
                          top: `${el.yPct}%`,
                          width: `${el.widthPct}%`,
                          height: `${el.heightPct}%`,
                        }}
                      >
                        <img src={el.dataUrl} alt="Inserted Overlay" className="w-full h-full object-contain" />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* Bottom Floating Toolbar */}
          <div className="absolute bottom-6 z-20 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-700 text-xs">
            {/* Page Nav */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="p-1 hover:bg-slate-800 rounded-lg disabled:opacity-30"
              >
                ‹
              </button>
              <span className="font-bold">{currentPage + 1} / {numPages}</span>
              <button
                disabled={currentPage >= numPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(numPages - 1, prev + 1))}
                className="p-1 hover:bg-slate-800 rounded-lg disabled:opacity-30"
              >
                ›
              </button>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(prev => Math.max(40, prev - 10))} className="p-1 hover:bg-slate-800 rounded-lg">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium font-mono min-w-[36px] text-center">{zoom}%</span>
              <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} className="p-1 hover:bg-slate-800 rounded-lg">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            <button onClick={() => setZoom(100)} className="hover:text-indigo-400 font-medium">
              Fit Width
            </button>
          </div>
        </main>

        {/* RIGHT PANEL: TEXT STYLES & PROPERTIES INSPECTOR */}
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Text & Style Inspector</h3>
            {selectedId && (
              <button
                onClick={() => {
                  setElements(prev => prev.filter(el => el.id !== selectedId));
                  setSelectedId(null);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* Font Family & Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Text Styles</label>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedEl?.fontFamily || fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    if (selectedId) updateSelectedElement({ fontFamily: e.target.value });
                  }}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl outline-none font-medium bg-slate-50"
                >
                  <option value="helvetica">Sans-Serif</option>
                  <option value="times">Serif</option>
                  <option value="courier">Monospace</option>
                </select>

                <select
                  value={selectedEl?.fontSize || fontSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value, 10);
                    setFontSize(size);
                    if (selectedId) updateSelectedElement({ fontSize: size });
                  }}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl outline-none font-medium bg-slate-50"
                >
                  <option value="12">12 pt</option>
                  <option value="14">14 pt</option>
                  <option value="16">16 pt</option>
                  <option value="18">18 pt</option>
                  <option value="24">24 pt</option>
                  <option value="32">32 pt</option>
                  <option value="48">48 pt</option>
                </select>
              </div>

              {/* Formatting Toggles */}
              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => {
                    const val = !(selectedEl?.bold ?? isBold);
                    setIsBold(val);
                    if (selectedId) updateSelectedElement({ bold: val });
                  }}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all flex-1 ${
                    (selectedEl?.bold ?? isBold) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Bold className="w-3.5 h-3.5 mx-auto" />
                </button>

                <button
                  onClick={() => {
                    const val = !(selectedEl?.italic ?? isItalic);
                    setIsItalic(val);
                    if (selectedId) updateSelectedElement({ italic: val });
                  }}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all flex-1 ${
                    (selectedEl?.italic ?? isItalic) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Italic className="w-3.5 h-3.5 mx-auto" />
                </button>

                <button
                  onClick={() => {
                    setTextAlign('left');
                    if (selectedId) updateSelectedElement({ align: 'left' });
                  }}
                  className={`p-2 rounded-lg border text-xs transition-all flex-1 ${
                    (selectedEl?.align || textAlign) === 'left' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5 mx-auto" />
                </button>

                <button
                  onClick={() => {
                    setTextAlign('center');
                    if (selectedId) updateSelectedElement({ align: 'center' });
                  }}
                  className={`p-2 rounded-lg border text-xs transition-all flex-1 ${
                    (selectedEl?.align || textAlign) === 'center' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5 mx-auto" />
                </button>

                <button
                  onClick={() => {
                    setTextAlign('right');
                    if (selectedId) updateSelectedElement({ align: 'right' });
                  }}
                  className={`p-2 rounded-lg border text-xs transition-all flex-1 ${
                    (selectedEl?.align || textAlign) === 'right' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Current Color</label>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl flex-1 bg-slate-50">
                  <input
                    type="color"
                    value={selectedEl?.color || color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      if (selectedId) updateSelectedElement({ color: e.target.value, strokeColor: e.target.value });
                    }}
                    className="w-6 h-6 rounded-md border-0 cursor-pointer bg-transparent"
                  />
                  <div className="text-xs font-mono font-medium text-slate-700">{selectedEl?.color || color}</div>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl flex-1 bg-slate-50">
                  <input
                    type="color"
                    value={selectedEl?.bgColor && selectedEl.bgColor !== 'transparent' ? selectedEl.bgColor : '#fef08a'}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      if (selectedId) updateSelectedElement({ bgColor: e.target.value, fillColor: e.target.value });
                    }}
                    className="w-6 h-6 rounded-md border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-bold text-slate-500">Fill / Highlight</span>
                </div>
              </div>
            </div>

            {/* Image / Signature Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Insert Image / Stamp</label>
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/30 text-slate-600">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">Upload Image / Stamp</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* SAVE CHANGES RED BUTTON */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Save changes</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
