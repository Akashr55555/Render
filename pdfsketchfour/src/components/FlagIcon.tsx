import React from 'react';
import {
  US,
  CN,
  IN,
  ES,
  FR,
  SA,
  BD,
  PT,
  RU,
  PK,
  ID,
  DE,
  JP,
  VN
} from 'country-flag-icons/react/3x2';

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

const FLAG_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  US,
  CN,
  IN,
  ES,
  FR,
  SA,
  BD,
  PT,
  RU,
  PK,
  ID,
  DE,
  JP,
  VN,
};

export const FlagIcon: React.FC<FlagIconProps> = ({ 
  countryCode, 
  className = "w-5 h-3.5 rounded-xs shadow-2xs border border-slate-200/80 inline-block overflow-hidden shrink-0 align-middle" 
}) => {
  const Component = FLAG_MAP[countryCode.toUpperCase()];
  if (!Component) {
    return <span className="text-base leading-none">🌐</span>;
  }
  return <Component className={className} />;
};

export default FlagIcon;
