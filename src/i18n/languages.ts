import type { Language, LangCode } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', tts: 'en-US' },
  { code: 'ko', name: '한국어', tts: 'ko-KR' },
  { code: 'ja', name: '日本語', tts: 'ja-JP' },
  { code: 'zh-Hans', name: '简体中文', tts: 'zh-CN' },
  { code: 'zh-Hant', name: '繁體中文', tts: 'zh-TW' },
  { code: 'es', name: 'Español', tts: 'es-ES' },
  { code: 'fr', name: 'Français', tts: 'fr-FR' },
  { code: 'de', name: 'Deutsch', tts: 'de-DE' },
  { code: 'it', name: 'Italiano', tts: 'it-IT' },
  { code: 'pt', name: 'Português', tts: 'pt-BR' },
  { code: 'ru', name: 'Русский', tts: 'ru-RU' },
  { code: 'ar', name: 'العربية', tts: 'ar-SA', rtl: true },
  { code: 'hi', name: 'हिन्दी', tts: 'hi-IN' },
  { code: 'vi', name: 'Tiếng Việt', tts: 'vi-VN' },
  { code: 'th', name: 'ไทย', tts: 'th-TH' },
  { code: 'id', name: 'Bahasa Indonesia', tts: 'id-ID' },
];

export const LANGUAGE_BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && LANGUAGE_BY_CODE.has(value as LangCode);
}

export function detectLanguage(preferred: readonly string[]): LangCode {
  for (const raw of preferred) {
    const tag = raw.toLowerCase();
    if (tag.startsWith('zh')) {
      return /hant|tw|hk|mo/.test(tag) ? 'zh-Hant' : 'zh-Hans';
    }
    const base = tag.split('-')[0];
    const match = LANGUAGES.find((l) => l.code === base);
    if (match) return match.code;
  }
  return 'en';
}
