import { describe, expect, it } from 'vitest';
import { ROSTER } from '../registry/roster';
import en from './en';
import { format } from './index';
import { LANGUAGES, detectLanguage } from './languages';
import type { LocaleMessages } from './types';

const locales = import.meta.glob<LocaleMessages>('./locales/*.ts', {
  eager: true,
  import: 'default',
});
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('english source', () => {
  it('names every rostered sticker', () => {
    for (const r of ROSTER) expect(en.names[r.id], r.id).toBe(r.name);
  });

  it('formats placeholders', () => {
    expect(format(en.ui.addSticker, { name: 'Lion', style: 'Comic' })).toBe('Add Lion (Comic)');
  });
});

describe('language detection', () => {
  it('maps browser languages', () => {
    expect(detectLanguage(['ko-KR'])).toBe('ko');
    expect(detectLanguage(['zh-TW'])).toBe('zh-Hant');
    expect(detectLanguage(['zh-CN'])).toBe('zh-Hans');
    expect(detectLanguage(['pt-BR', 'en'])).toBe('pt');
    expect(detectLanguage(['xx'])).toBe('en');
  });
});

describe('translations', () => {
  it('ships a locale for every language', () => {
    const codes = Object.keys(locales).map((f) => f.replace(/^.*\//, '').replace(/\.ts$/, ''));
    for (const l of LANGUAGES.filter((x) => x.code !== 'en')) expect(codes).toContain(l.code);
  });

  it.each(Object.entries(locales))('%s is complete', (_file, m) => {
    for (const [key, value] of Object.entries(en.ui)) {
      const local = m.ui[key as keyof typeof en.ui] ?? '';
      expect(local, key).toBeTruthy();
      expect(placeholders(local), key).toBe(placeholders(value));
    }
    for (const key of Object.keys(en.worlds))
      expect(m.worlds[key as keyof typeof en.worlds]).toBeTruthy();
    for (const key of Object.keys(en.foods))
      expect(m.foods[key as keyof typeof en.foods]).toBeTruthy();
    for (const r of ROSTER) expect(m.names[r.id], r.id).toBeTruthy();
  });
});
