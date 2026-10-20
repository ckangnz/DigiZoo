import type { HabitatId, StyleId } from '../art/core/types';
import type { LangCode } from '../i18n/types';

export interface Sticker {
  id: string;
  animalId: string;
  style: StyleId;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
}

export interface View {
  cx: number;
  cy: number;
  z: number;
}

export interface Prefs {
  themeId: HabitatId | null;
  night: boolean;
  muted: boolean;
  sayNames: boolean;
  lang: LangCode | null;
  voices: Partial<Record<LangCode, string>>;
}
