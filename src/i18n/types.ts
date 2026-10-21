import type { HabitatId, StyleId } from '../art/core/types';
import type { FoodId } from '../food/foods';

export type LangCode =
  | 'en'
  | 'ko'
  | 'ja'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ru'
  | 'ar'
  | 'hi'
  | 'vi'
  | 'th'
  | 'id';

export interface UiStrings {
  pickWorld: string;
  chooseAnotherWorld: string;
  close: string;
  undo: string;
  dayTime: string;
  nightTime: string;
  startOver: string;
  startOverQuestion: string;
  emptyMap: string;
  starterSet: string;
  pressAndHold: string;
  settings: string;
  sounds: string;
  sayNames: string;
  language: string;
  credits: string;
  creditsIntro: string;
  zoomIn: string;
  zoomOut: string;
  showWholeMap: string;
  addStickers: string;
  stickers: string;
  closeStickers: string;
  findSticker: string;
  clearSearch: string;
  noResults: string;
  here: string;
  all: string;
  addSticker: string;
  playSound: string;
  walk: string;
  stopWalking: string;
  move: string;
  stop: string;
  flip: string;
  duplicate: string;
  bringForward: string;
  sendBackward: string;
  delete: string;
  feed: string;
  rotate: string;
  resize: string;
  whatToEat: string;
  feedFood: string;
  aboutName: string;
  didYouKnow: string;
  likesToEat: string;
  findItIn: string;
  readAloud: string;
  stopReading: string;
  matchingGame: string;
  findPairs: string;
  gridSize: string;
  cardsFrom: string;
  allWorlds: string;
  moves: string;
  youDidIt: string;
  foundAllPairs: string;
  bestScore: string;
  newBest: string;
  playAgain: string;
  backToMap: string;
  newGame: string;
  card: string;
  freeStar: string;
  voice: string;
  automaticVoice: string;
  voiceTip: string;
  installApp: string;
  installTitle: string;
  installIntro: string;
  installNow: string;
  installed: string;
  installHint: string;
  installIphone: string;
  installAndroid: string;
  installComputer: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
  androidStep1: string;
  androidStep2: string;
  androidStep3: string;
  computerStep1: string;
  computerStep2: string;
}

export interface LocaleMessages {
  ui: Partial<UiStrings>;
  worlds: Partial<Record<HabitatId, string>>;
  styles: Partial<Record<StyleId, string>>;
  foods: Partial<Record<FoodId, string>>;
  names: Record<string, string>;
  aliases?: Record<string, string[]>;
}

export interface Messages {
  ui: UiStrings;
  worlds: Record<HabitatId, string>;
  styles: Record<StyleId, string>;
  foods: Record<FoodId, string>;
  names: Record<string, string>;
  aliases?: Record<string, string[]>;
}

export interface Language {
  code: LangCode;
  name: string;
  tts: string;
  rtl?: boolean;
}
