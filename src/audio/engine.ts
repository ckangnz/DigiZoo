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
let current: { gain: GainNode; timer: ReturnType<typeof setTimeout> } | null = null;
let muted = false;
let speechUnlocked = false;
let speakTimer: ReturnType<typeof setTimeout> | undefined;

const MASTER_LEVEL = 0.9;

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
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

export function playAnimal(id: string): number {
  const c = ensure();
  if (!c) return 0;
  stopAnimal();
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

export function stopAnimal(): void {
  if (!current || !ctx) return;
  const { gain, timer } = current;
  current = null;
  clearTimeout(timer);
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.08);
  setTimeout(() => gain.disconnect(), 160);
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
  if (value) {
    stopAnimal();
    cancelSpeech();
  }
}

const PREFERRED_VOICES = [
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Google US English',
  'Google UK English Female',
  'Microsoft Aria',
  'Microsoft Jenny',
];

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.localService) ?? voices[0];
}

export function speak(text: string, delayMs = 0): void {
  if (muted || typeof speechSynthesis === 'undefined') return;
  clearTimeout(speakTimer);
  speakTimer = setTimeout(() => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1.15;
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? 'en-US';
      speechSynthesis.speak(u);
    } catch {
      return;
    }
  }, delayMs);
}

export function cancelSpeech(): void {
  clearTimeout(speakTimer);
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
