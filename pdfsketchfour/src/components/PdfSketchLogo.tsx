import React from 'react';
import logoImg from '../assets/images/pdfsketch_pen_on_book_icon_1786393586478.jpg';

interface PdfSketchLogoProps {
  className?: string;
  showTagline?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'image' | 'svg' | 'both';
}

export const PdfSketchLogo: React.FC<PdfSketchLogoProps> = ({
  className = '',
  showTagline = true,
  showText = true,
  size = 'md',
  variant = 'both',
}) => {
  const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  };

  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center group cursor-pointer ${className}`}>
        <div className={`relative ${containerSizes[size]} rounded-xl overflow-hidden shadow-xs border border-teal-200/80 bg-white group-hover:scale-105 transition-all duration-200 p-0.5 flex items-center justify-center`}>
          <img
            src={logoImg}
            alt="PDFSketch Logo Mark"
            className="w-full h-full object-contain scale-115"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* Lotus Book Pen Emblem fitted snugly inside the border */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className={`relative ${containerSizes[size]} rounded-xl overflow-hidden shadow-md border border-teal-200/80 group-hover:scale-105 group-hover:rotate-1 transition-all duration-200 bg-white p-0.5 flex items-center justify-center`}>
          <img
            src={logoImg}
            alt="PDFSketch Lotus Emblem"
            className="w-full h-full object-contain scale-115"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight font-heading flex items-baseline ${textSizes[size]}`}>
            <span className="text-slate-900 group-hover:text-teal-700 transition-colors">PDF</span>
            <span className="text-teal-600 transition-colors">Sketch</span>
            {showTagline && <span className="text-slate-500 font-medium text-[0.6em] ml-0.5">.com</span>}
          </div>
        </div>
      )}
    </div>
  );
};


