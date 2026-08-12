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
  showText = true,
  size = 'md',
}) => {
  const containerSizes = {
    sm: 'w-10 h-10 rounded-[14px]',
    md: 'w-13 h-13 sm:w-14 sm:h-14 rounded-[18px]',
    lg: 'w-20 h-20 rounded-[26px]',
  };

  const mainTextSizes = {
    sm: 'text-xl',
    md: 'text-[28px] sm:text-[32px]',
    lg: 'text-4xl sm:text-5xl',
  };

  const comTextSizes = {
    sm: 'text-xs',
    md: 'text-base sm:text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-3.5 group cursor-pointer select-none ${className}`}>
      {/* Icon Badge Container - Filling empty space with larger icon emblem */}
      <div
        className={`relative ${containerSizes[size]} bg-white border-[1.5px] border-[#38e8cb] shadow-[0_4px_14px_rgba(0,0,0,0.08),0_2px_8px_rgba(56,232,203,0.18)] flex items-center justify-center p-1 overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-[1.04]`}
      >
        <img
          src={logoImg}
          alt="PDFSketch Logo"
          className="w-full h-full object-contain mix-blend-multiply scale-110 transform"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Typography: PDF in solid dark navy (#0e1726), Sketch in rich cyan-teal (#00a89d), .com in cool slate (#475569) */}
      {showText && (
        <div className="flex items-baseline font-sans font-black tracking-tight leading-none">
          <span className={`text-[#0e1726] tracking-tight transition-colors group-hover:text-[#00a89d] ${mainTextSizes[size]}`}>
            PDF
          </span>
          <span className={`text-[#00a89d] tracking-tight transition-colors ${mainTextSizes[size]}`}>
            Sketch
          </span>
          <span className={`text-[#475569] font-semibold tracking-normal ml-0.5 ${comTextSizes[size]}`}>
            .com
          </span>
        </div>
      )}
    </div>
  );
};

export default PdfSketchLogo;
