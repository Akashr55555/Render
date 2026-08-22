import React from 'react';
import { FileQuestion, ArrowLeft, Layers, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  const popularTools = [
    { title: 'Merge PDF', path: '/merge-pdf/' },
    { title: 'Compress PDF', path: '/compress-pdf/' },
    { title: 'PDF to Word', path: '/pdf-to-word/' },
    { title: 'Split PDF', path: '/split-pdf/' },
    { title: 'OCR PDF', path: '/ocr-pdf/' },
    { title: 'Edit PDF', path: '/edit-pdf/' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-800">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-200/80 shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>
      <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 my-4">
        Oops! We Couldn't Find That PDF Tool Page
      </h1>
      <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
        The URL you accessed might have moved or doesn't exist. You can return to our homepage or explore our most popular free PDF tools below.
      </p>

      <div className="flex justify-center mb-12">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </a>
      </div>

      <div className="border-t border-slate-200 pt-8 max-w-2xl mx-auto text-left">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Popular Free PDF Tools</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularTools.map((tool) => (
            <a
              key={tool.path}
              href={tool.path}
              onClick={(e) => handleLinkClick(e, tool.path)}
              className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors flex items-center justify-between group shadow-2xs"
            >
              <span>{tool.title}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
