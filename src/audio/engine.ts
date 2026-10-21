import type { Recipe, SfxName, Voice } from './types';

const recipeModules = import.meta.glob<Recipe>('./recipes/*.ts', {
  eager: true,
  import: 'default',
});
const RECIPES = new Map(
  Object.entries(recipeModules).map(([file, recipe]) => [
    file.replace(/^.*\//, '').replace(/\.ts$/, ''),
    recipe,
  ]),
);

const sfxModules = import.meta.glob<Partial<Record<SfxName, Recipe>>>('./sfx.ts', {
  eager: true,
  import: 'SFX',
});
const SFX: Partial<Record<SfxName, Recipe>> = Object.values(sfxModules)[0] ?? {};

export interface SampleCredit {
  id: string;
  file: string;
  duration: number;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
  changes?: string;
  sources?: {
    title: string;
    author: string;
    license: string;
    licenseUrl?: string;
    source: string;
  }[];
}

const idOf = (file: string) => file.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/, '');

const sampleUrlModules = import.meta.glob<string>('./samples/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});
const SAMPLE_URLS = new Map(Object.entries(sampleUrlModules).map(([f, url]) => [idOf(f), url]));

const creditModules = import.meta.glob<SampleCredit>('./samples/*.json', {
  eager: true,
  import: 'default',
});
const CREDITS = new Map(Object.entries(creditModules).map(([f, c]) => [idOf(f), c]));

export function soundCredits(): SampleCredit[] {
  return [...CREDITS.values()]
    .filter((c) => SAMPLE_URLS.has(c.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function hasSample(id: string): boolean {
  return SAMPLE_URLS.has(id);
}

const fallback: Recipe = ({ ctx, out, t0, rand }) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const f0 = 520 * (0.95 + rand() * 0.1);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(f0 * 1.8, t0 + 0.12);
  osc.frequency.exponentialRampToValueAtTime(f0 * 0.9, t0 + 0.3);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + 0.4);
  return 0.4;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: DynamicsCompressorNode | null = null;
let current: {
  gain: GainNode;
  timer: ReturnType<typeof setTimeout>;
  source?: AudioBufferSourceNode;
} | null = null;
const buffers = new Map<string, Promise<AudioBuffer>>();
let muted = false;
let speechUnlocked = false;
let speakTimer: ReturnType<typeof setTimeout> | undefined;

const MASTER_LEVEL = 0.9;

const silent =
  typeof window !== 'undefined' &&
  ((window as unknown as { __DIGIZOO_SILENT__?: boolean }).__DIGIZOO_SILENT__ === true ||
    new URLSearchParams(window.location.search).has('silent'));

function ensure(): AudioContext | null {
  if (typeof window === 'undefined' || silent) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    bus = ctx.createDynamicsCompressor();
    bus.threshold.value = -14;
    bus.knee.value = 10;
    bus.ratio.value = 4;
    bus.attack.value = 0.003;
    bus.release.value = 0.25;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_LEVEL;
    bus.connect(master).connect(ctx.destination);
    const created = ctx;
    setTimeout(() => {
      for (const id of wanted) void loadBuffer(created, id)?.catch(() => undefined);
    }, 50);
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) {
      try {
        session.type = 'playback';
      } catch {
        session.type = 'ambient';
      }
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  ensure();
  if (!speechUnlocked && typeof speechSynthesis !== 'undefined') {
    speechUnlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch {
      speechUnlocked = false;
    }
  }
}

function createVoice(c: AudioContext, level: number): { voice: Voice; gain: GainNode } {
  const gain = c.createGain();
  gain.gain.value = level;
  gain.connect(bus!);
  return { voice: { ctx: c, out: gain, t0: c.currentTime + 0.015, rand: Math.random }, gain };
}

export function hasRecipe(id: string): boolean {
  return RECIPES.has(id);
}

function loadBuffer(c: BaseAudioContext, id: string): Promise<AudioBuffer> | null {
  const url = SAMPLE_URLS.get(id);
  if (!url) return null;
  let pending = buffers.get(id);
  if (!pending) {
    pending = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => c.decodeAudioData(data));
    pending.catch(() => buffers.delete(id));
    buffers.set(id, pending);
  }
  return pending;
}

let wanted: string[] = [];

export function preloadSounds(ids: string[]): void {
  wanted = ids;
  const keep = new Set(ids);
  for (const id of [...buffers.keys()]) if (!keep.has(id)) buffers.delete(id);
  if (!ctx) return;
  for (const id of ids) void loadBuffer(ctx, id)?.catch(() => undefined);
}

function playRecipe(c: AudioContext, id: string): number {
  const { voice, gain } = createVoice(c, 1);
  let duration = 0.8;
  try {
    duration = (RECIPES.get(id) ?? fallback)(voice);
  } catch (e) {
    console.warn('sound failed', id, e);
  }
  const timer = setTimeout(
    () => {
      gain.disconnect();
      if (current?.gain === gain) current = null;
    },
    (duration + 0.4) * 1000,
  );
  current = { gain, timer };
  return duration;
}

export function playAnimal(id: string): number {
  const c = ensure();
  if (!c) return 0;
  stopAnimal();
  if (muted) return 0;
  const pending = loadBuffer(c, id);
  if (!pending) return playRecipe(c, id);
  const duration = CREDITS.get(id)?.duration ?? 1.6;
  const gain = c.createGain();
  gain.gain.value = 1;
  gain.connect(master!);
  const timer = setTimeout(
    () => {
      gain.disconnect();
      if (current?.gain === gain) current = null;
    },
    (duration + 1.2) * 1000,
  );
  const voice: NonNullable<typeof current> = { gain, timer };
  current = voice;
  pending
    .then((buffer) => {
      if (current !== voice) return;
      const source = c.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start();
      voice.source = source;
    })
    .catch(() => {
      if (current === voice) {
        current = null;
        clearTimeout(timer);
        gain.disconnect();
        playRecipe(c, id);
      }
    });
  return duration;
}

export function stopAnimal(): void {
  if (!current || !ctx) return;
  const { gain, timer, source } = current;
  current = null;
  clearTimeout(timer);
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.08);
  setTimeout(() => {
    try {
      source?.stop();
    } catch {
      gain.disconnect();
    }
    gain.disconnect();
  }, 160);
}

export function playSfx(name: SfxName): void {
  if (muted) return;
  const recipe = SFX[name];
  if (!recipe) return;
  const c = ensure();
  if (!c) return;
  const { voice, gain } = createVoice(c, 0.55);
  let duration = 0.4;
  try {
    duration = recipe(voice);
  } catch {
    duration = 0.1;
  }
  setTimeout(() => gain.disconnect(), (duration + 0.3) * 1000);
}

export function setAudioMuted(value: boolean): void {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : MASTER_LEVEL, ctx.currentTime, 0.02);
  if (value) stopAnimal();
}

const NOVELTY_VOICES =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|ralph|fred|junior|kathy|grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b/i;

export type VoiceQuality = 'natural' | 'good' | 'basic';

export interface VoiceOption {
  uri: string;
  name: string;
  lang: string;
  quality: VoiceQuality;
}

const preferredVoices = new Map<string, string>();

export function setPreferredVoice(lang: string, uri: string | null): void {
  if (uri) preferredVoices.set(lang, uri);
  else preferredVoices.delete(lang);
}

function voiceScore(v: SpeechSynthesisVoice, lang: string): number {
  const name = v.name.toLowerCase();
  let score = 0;
  if (/premium|neural|natural/.test(name)) score += 60;
  else if (/enhanced|siri/.test(name)) score += 45;
  else if (/google|online/.test(name)) score += 30;
  if (/compact/.test(name)) score -= 20;
  if (NOVELTY_VOICES.test(name)) score -= 100;
  if (v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase()) score += 8;
  if (v.localService) score += 2;
  if (v.default) score += 1;
  return score;
}

function qualityOf(score: number): VoiceQuality {
  return score >= 50 ? 'natural' : score >= 25 ? 'good' : 'basic';
}

function voicesFor(lang: string): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return [];
  const base = lang.toLowerCase().split('-')[0];
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace('_', '-').split('-')[0] === base)
    .sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang) || a.name.localeCompare(b.name));
}

export function listVoices(lang: string): VoiceOption[] {
  return voicesFor(lang)
    .filter((v) => !NOVELTY_VOICES.test(v.name))
    .map((v) => ({
      uri: v.voiceURI,
      name: v.name,
      lang: v.lang,
      quality: qualityOf(voiceScore(v, lang)),
    }));
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = voicesFor(lang);
  const wanted = preferredVoices.get(lang);
  return (wanted && voices.find((v) => v.voiceURI === wanted)) || voices[0];
}

export function speak(text: string, delayMs = 0, lang = 'en-US', onEnd?: () => void): void {
  if (typeof speechSynthesis === 'undefined') {
    onEnd?.();
    return;
  }
  clearTimeout(speakTimer);
  speakTimer = setTimeout(() => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      const voice = pickVoice(lang);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? lang;
      if (onEnd) {
        u.onend = onEnd;
        u.onerror = onEnd;
      }
      speechSynthesis.speak(u);
    } catch {
      onEnd?.();
    }
  }, delayMs);
}

export function cancelSpeech(): void {
  clearTimeout(speakTimer);
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
