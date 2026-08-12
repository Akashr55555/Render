export interface Language {
  code: string;
  name: string;
  nativeName: string;
  countryCode: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', countryCode: 'US', flag: '🇺🇸' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文', countryCode: 'CN', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', countryCode: 'ES', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', countryCode: 'FR', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'SA', flag: '🇸🇦' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', countryCode: 'BD', flag: '🇧🇩' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', countryCode: 'PT', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', countryCode: 'RU', flag: '🇷🇺' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', countryCode: 'PK', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', countryCode: 'ID', flag: '🇮🇩' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', countryCode: 'DE', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', countryCode: 'JP', flag: '🇯🇵' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', countryCode: 'VN', flag: '🇻🇳' },
];
