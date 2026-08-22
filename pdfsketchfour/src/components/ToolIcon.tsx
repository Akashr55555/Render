import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Layers,
  Scissors,
  RotateCw,
  Hash,
  Crop,
  Minimize2,
  Wrench,
  ScanText,
  Presentation,
  Lock,
  Unlock,
  Stamp,
  Sparkles,
  Edit3,
  EyeOff,
  PenTool,
  Globe,
  Archive,
  Camera,
  GitCompare,
  CheckSquare,
  Languages
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case 'merge':
      return (
        <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Layers className={className} />
        </div>
      );
    case 'split':
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Scissors className={className} />
        </div>
      );
    case 'organize':
      return (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <Layers className={className} />
        </div>
      );
    case 'rotate':
      return (
        <div className="w-12 h-12 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <RotateCw className={className} />
        </div>
      );
    case 'pagenumbers':
      return (
        <div className="w-12 h-12 rounded-xl bg-violet-100/80 text-violet-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Hash className={className} />
        </div>
      );
    case 'crop':
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Crop className={className} />
        </div>
      );
    case 'compress':
      return (
        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Minimize2 className={className} />
        </div>
      );
    case 'repair':
      return (
        <div className="w-12 h-12 rounded-xl bg-cyan-100/80 text-cyan-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Wrench className={className} />
        </div>
      );
    case 'ocr':
      return (
        <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <ScanText className={className} />
        </div>
      );
    case 'pdfword':
    case 'wordpdf':
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <FileText className={className} />
        </div>
      );
    case 'pdfppt':
    case 'ppttopdf':
    case 'pptpdf':
      return (
        <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Presentation className={className} />
        </div>
      );
    case 'pdfexcel':
    case 'exceltopdf':
    case 'excelpdf':
      return (
        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <FileSpreadsheet className={className} />
        </div>
      );
    case 'pdfjpg':
    case 'jpgpdf':
      return (
        <div className="w-12 h-12 rounded-xl bg-yellow-100/80 text-yellow-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <ImageIcon className={className} />
        </div>
      );
    case 'edit':
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Edit3 className={className} />
        </div>
      );
    case 'watermark':
      return (
        <div className="w-12 h-12 rounded-xl bg-cyan-100/80 text-cyan-800 flex items-center justify-center transition-transform group-hover:scale-110">
          <Stamp className={className} />
        </div>
      );
    case 'protect':
      return (
        <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <Lock className={className} />
        </div>
      );
    case 'unlock':
      return (
        <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Unlock className={className} />
        </div>
      );
    case 'redact':
      return (
        <div className="w-12 h-12 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <EyeOff className={className} />
        </div>
      );
    case 'markdown':
      return (
        <div className="w-12 h-12 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <FileCode className={className} />
        </div>
      );
    case 'summarize':
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
          <Sparkles className={className} />
        </div>
      );
    case 'sign':
      return (
        <div className="w-12 h-12 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <PenTool className={className} />
        </div>
      );
    case 'htmltopdf':
      return (
        <div className="w-12 h-12 rounded-xl bg-yellow-100/80 text-yellow-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Globe className={className} />
        </div>
      );
    case 'pdftopdfa':
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center transition-transform group-hover:scale-110">
          <Archive className={className} />
        </div>
      );
    case 'scan':
      return (
        <div className="w-12 h-12 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Camera className={className} />
        </div>
      );
    case 'compare':
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <GitCompare className={className} />
        </div>
      );
    case 'forms':
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <CheckSquare className={className} />
        </div>
      );
    case 'translate':
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Languages className={className} />
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <FileText className={className} />
        </div>
      );
  }
};

