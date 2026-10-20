import { useMemo } from 'react';
import { create } from 'zustand';
import type { HabitatId, StyleId } from '../art/core/types';
import type { FoodId } from '../food/foods';
import en from './en';
import { LANGUAGE_BY_CODE } from './languages';
import type { LangCode, Language, LocaleMessages, Messages, UiStrings } from './types';

const loaders = import.meta.glob<LocaleMessages>('./locales/*.ts', { import: 'default' });

interface I18nState {
  lang: LangCode;
  messages: Messages;
}

export const useI18n = create<I18nState>(() => ({ lang: 'en', messages: en }));

function merge(base: Messages, extra: LocaleMessages): Messages {
  return {
    ui: { ...base.ui, ...extra.ui },
    worlds: { ...base.worlds, ...extra.worlds },
    styles: { ...base.styles, ...extra.styles },
    foods: { ...base.foods, ...extra.foods },
    names: { ...base.names, ...extra.names },
    aliases: extra.aliases,
  };
}

export function availableLanguages(): Language[] {
  return [...LANGUAGE_BY_CODE.values()].filter(
    (l) => l.code === 'en' || `./locales/${l.code}.ts` in loaders,
  );
}

export async function loadLanguage(lang: LangCode): Promise<void> {
  const loader = loaders[`./locales/${lang}.ts`];
  let messages = en;
  let code: LangCode = 'en';
  if (lang !== 'en' && loader) {
    try {
      messages = merge(en, await loader());
      code = lang;
    } catch {
      messages = en;
    }
  }
  useI18n.setState({ lang: code, messages });
  if (typeof document !== 'undefined') document.documentElement.lang = code;
}

export type UiKey = keyof UiStrings;

export function format(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}

export interface Translator {
  lang: LangCode;
  t: (key: UiKey, vars?: Record<string, string>) => string;
  name: (id: string, fallback?: string) => string;
  world: (id: HabitatId) => string;
  style: (id: StyleId) => string;
  food: (id: FoodId) => string;
  aliases: (id: string) => string[];
}

export function translator(lang: LangCode, m: Messages): Translator {
  return {
    lang,
    t: (key, vars) => format(m.ui[key] ?? en.ui[key], vars),
    name: (id, fallback) => m.names[id] ?? en.names[id] ?? fallback ?? id,
    world: (id) => m.worlds[id] ?? en.worlds[id],
    style: (id) => m.styles[id] ?? en.styles[id],
    food: (id) => m.foods[id] ?? en.foods[id],
    aliases: (id) => m.aliases?.[id] ?? [],
  };
}

export function tr(): Translator {
  const { lang, messages } = useI18n.getState();
  return translator(lang, messages);
}

export function useT(): Translator {
  const lang = useI18n((s) => s.lang);
  const messages = useI18n((s) => s.messages);
  return useMemo(() => translator(lang, messages), [lang, messages]);
}

export function ttsLang(lang: LangCode): string {
  return LANGUAGE_BY_CODE.get(lang)?.tts ?? 'en-US';
}

export function isRtl(lang: LangCode): boolean {
  return !!LANGUAGE_BY_CODE.get(lang)?.rtl;
}
