export function sanitizeWinAnsi(str: string, font?: any): string {
  if (!str) return '';
  let cleaned = str
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25CF\u25CB\u25A0]/g, '•')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  if (font && typeof font.encodeText === 'function') {
    let result = '';
    for (const char of cleaned) {
      if (char === '\n' || char === '\t') {
        result += char;
        continue;
      }
      try {
        font.encodeText(char);
        result += char;
      } catch (_) {
        result += ' ';
      }
    }
    return result;
  }

  return cleaned
    .replace(/[^\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/[ \t]+/g, ' ');
}

