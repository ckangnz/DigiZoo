import type { Language, LangCode } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', tts: 'en-US' },
  { code: 'ko', name: '한국어', tts: 'ko-KR' },
  { code: 'ja', name: '日本語', tts: 'ja-JP' },
  { code: 'zh-Hans', name: '中文', tts: 'zh-CN' },
  { code: 'es', name: 'Español', tts: 'es-ES' },
];

export const LANGUAGE_BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && LANGUAGE_BY_CODE.has(value as LangCode);
}

export function detectLanguage(preferred: readonly string[]): LangCode {
  for (const raw of preferred) {
    const tag = raw.toLowerCase();
    if (tag.startsWith('zh')) return 'zh-Hans';
    const base = tag.split('-')[0];
    const match = LANGUAGES.find((l) => l.code === base);
    if (match) return match.code;
  }
  return 'en';
}
