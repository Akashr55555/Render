import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES, Language } from '../i18n/languages';
import { FlagIcon } from './FlagIcon';

export type { Language };
export { LANGUAGES };

interface LanguageSelectorProps {
  className?: string;
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  onLanguageChange,
}) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button styled like the screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden"
        aria-expanded={isOpen}
        aria-haspopup="true"
        id="language-menu-button"
      >
        <FlagIcon countryCode={currentLanguage.countryCode} className="w-5 h-3.5 rounded-[2px] shadow-2xs border border-slate-300/80 object-cover inline-block shrink-0" />
        <span className="text-sm font-medium text-slate-800">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-50 max-h-80 overflow-y-auto focus:outline-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
        >
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            {t('selectLanguage')}
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-teal-50 text-[#009b8d] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <FlagIcon countryCode={lang.countryCode} className="w-5 h-3.5 rounded-[2px] shadow-2xs border border-slate-200 object-cover inline-block shrink-0" />
                  <div className="flex flex-col">
                    <span className="leading-tight">{lang.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{lang.nativeName}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#009b8d]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

