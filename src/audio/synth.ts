import type { Voice } from './types';

export type Ramp = 'lin' | 'exp' | 'set';
export type Point = readonly [time: number, value: number, ramp?: Ramp];
export type Contour = number | readonly Point[];
export type NoiseColor = 'white' | 'pink' | 'brown';
export type CustomWave = 'pulse' | 'glottal' | 'buzz' | 'reed' | 'hollow' | 'soft';
export type WaveName = 'sine' | 'square' | 'sawtooth' | 'triangle' | CustomWave;
export type Wave = WaveName | readonly number[];
export type VowelName = 'a' | 'e' | 'i' | 'o' | 'u' | 'n';

export interface Formant {
  freq: number;
  bw: number;
  amp: number;
}

export type Vowel = VowelName | readonly Formant[];
export type VowelStep = readonly [time: number, vowel: Vowel];
export type VowelPath = Vowel | readonly VowelStep[];

export interface Routing {
  at?: number;
  dest?: AudioNode;
}

export interface Span extends Routing {
  dur: number;
}

export interface Adsr {
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  peak?: number;
}

export interface Vibrato {
  rate: number;
  depth: number;
  delay?: number;
}

export interface Growl {
  rate: number;
  depth: number;
  fry?: number;
}

export interface OscOptions extends Span {
  scale?: number;
  ramp?: Ramp;
  detune?: number;
}

export interface LfoOptions extends Span {
  rate: Contour;
  depth: Contour;
  wave?: Wave;
}

export interface WanderOptions extends Span {
  depth: Contour;
  rate?: number;
}

export interface NoiseOptions extends Span {
  rate?: number;
}

export interface FilterOptions extends Routing {
  gain?: number;
}

export interface FormantOptions extends Routing {
  shift?: number;
  width?: number;
}

export interface NoteOptions extends Span {
  freq: Contour;
  wave?: Wave;
  gain?: number;
  env?: readonly Point[];
  attack?: number;
  release?: number;
  vibrato?: Vibrato;
  transpose?: number;
  lowpass?: Contour;
  pan?: Contour;
}

export interface VocalOptions extends Span {
  pitch: Contour;
  vowel: VowelPath;
  gain?: number;
  env?: readonly Point[];
  attack?: number;
  release?: number;
  wave?: Wave;
  breath?: number;
  shift?: number;
  width?: number;
  vibrato?: Vibrato;
  jitter?: number;
  growl?: Growl;
  sub?: number;
  drive?: number;
  tone?: Contour;
  body?: number;
  transpose?: number;
  pan?: Contour;
}

export interface ChirpOptions extends Span {
  freq: Contour;
  gain?: number;
  wave?: Wave;
  attack?: number;
  vibrato?: Vibrato;
  pan?: Contour;
}

export interface BubbleOptions extends Routing {
  freq: number;
  rise?: number;
  dur?: number;
  gain?: number;
  pan?: Contour;
}

export interface ClickOptions extends Routing {
  freq?: number;
  q?: number;
  dur?: number;
  gain?: number;
  ring?: number;
  color?: NoiseColor;
  pan?: Contour;
}

export interface ClickTrainOptions extends Routing {
  times: readonly number[];
  freq?: number | readonly number[];
  gain?: number | readonly number[];
  q?: number;
  dur?: number;
  ring?: number;
  color?: NoiseColor;
  pan?: Contour;
}

export interface ThumpOptions extends Routing {
  from?: number;
  to?: number;
  dur?: number;
  gain?: number;
  thud?: number;
  pan?: Contour;
}

export interface BurstOptions extends Span {
  color?: NoiseColor;
  type?: BiquadFilterType;
  freq: Contour;
  q?: Contour;
  gain?: number;
  env?: readonly Point[];
  swell?: number;
  attack?: number;
  release?: number;
  rate?: number;
  pan?: Contour;
}

export interface BellOptions extends Routing {
  freq: number;
  dur: number;
  gain?: number;
  partials?: readonly (readonly [ratio: number, amp: number, decay: number])[];
  pan?: Contour;
}

export interface ReverbOptions extends Routing {
  seconds?: number;
  wet?: number;
  bright?: number;
}

export interface EchoOptions extends Routing {
  time: number;
  feedback?: number;
  wet?: number;
  tone?: number;
}

const formant = (freq: number, bw: number, db: number): Formant => ({
  freq,
  bw,
  amp: 10 ** (db / 20),
});

export const VOWELS: Record<VowelName, readonly Formant[]> = {
  a: [
    formant(750, 100, 0),
    formant(1150, 110, -3),
    formant(2600, 150, -10),
    formant(3500, 220, -16),
  ],
  e: [formant(500, 80, 0), formant(1800, 110, -6), formant(2550, 150, -9), formant(3500, 220, -16)],
  i: [formant(300, 60, 0), formant(2250, 110, -6), formant(2950, 150, -8), formant(3700, 220, -14)],
  o: [formant(500, 80, 0), formant(850, 90, -3), formant(2500, 150, -18), formant(3400, 220, -24)],
  u: [formant(340, 70, 0), formant(780, 90, -10), formant(2400, 160, -24), formant(3300, 220, -30)],
  n: [
    formant(270, 90, 0),
    formant(1050, 220, -20),
    formant(2250, 220, -22),
    formant(3300, 260, -28),
  ],
};

export const BELL_PARTIALS: readonly (readonly [number, number, number])[] = [
  [1, 1, 1],
  [2.76, 0.32, 0.55],
  [5.4, 0.14, 0.32],
  [8.93, 0.06, 0.2],
];

const MIN_LEVEL = 1e-5;
const FADE_FLOOR = 0.003;
const SOURCE_PAD = 0.02;
const NOISE_SECONDS = 2.5;
const DRIFT_SECONDS = 4;
const DRIFT_KNOTS_PER_SECOND = 40;
const VOCAL_MAKEUP = 8;
const LIMIT_RANGE = 2;
const LIMIT_KNEE = 0.65;
const LIMIT_CEILING = 0.92;

const CUSTOM_SPECTRA: Record<CustomWave, (n: number) => number> = {
  pulse: (n) => 1 / n ** 0.3,
  glottal: (n) => 1 / n ** 1.45,
  buzz: (n) => 1 / n ** 0.8,
  reed: (n) => (n % 2 === 1 ? 1 : 0.35) / n ** 0.45,
  hollow: (n) => (n % 2 === 1 ? 1 / n ** 1.1 : 0.06 / n),
  soft: (n) => 1 / n ** 2.6,
};

const HARMONIC_COUNT = 48;

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function automate(
  param: AudioParam,
  start: number,
  contour: Contour,
  scale = 1,
  ramp: Ramp = 'lin',
): void {
  if (typeof contour === 'number') {
    param.setValueAtTime(contour * scale, start);
    return;
  }
  const points = [...contour].sort((a, b) => a[0] - b[0]);
  let previous = 0;
  points.forEach(([offset, raw, shape = ramp], index) => {
    const time = start + Math.max(0, offset);
    const value = raw * scale;
    if (index === 0) {
      param.setValueAtTime(value, start);
      if (offset > 0) param.setValueAtTime(value, time);
    } else if (shape === 'set') {
      param.setValueAtTime(value, time);
    } else if (shape === 'exp' && previous > 0 && value > 0) {
      param.exponentialRampToValueAtTime(value, time);
    } else if (shape === 'exp' && previous > 0) {
      param.exponentialRampToValueAtTime(Math.max(previous * FADE_FLOOR, MIN_LEVEL), time);
      param.setValueAtTime(value, time);
    } else {
      param.linearRampToValueAtTime(value, time);
    }
    previous = value;
  });
}

export function scaleContour(contour: Contour, factor: number): Contour {
  if (typeof contour === 'number') return contour * factor;
  return contour.map(([time, value, ramp]) =>
    ramp ? ([time, value * factor, ramp] as const) : ([time, value * factor] as const),
  );
}

export function mapContour(contour: Contour, fn: (value: number) => number): Contour {
  if (typeof contour === 'number') return fn(contour);
  return contour.map(([time, value, ramp]) =>
    ramp ? ([time, fn(value), ramp] as const) : ([time, fn(value)] as const),
  );
}

function spacing(starts: readonly number[], index: number, length: number): number {
  const next = starts[index + 1];
  if (next === undefined || length <= 0) return 1;
  return Math.min(1, Math.max(0, next - starts[index]) / length);
}

export function sequence(
  pattern: readonly Point[],
  starts: readonly number[],
  scale: (index: number) => number = () => 1,
): Point[] {
  const length = Math.max(0, ...pattern.map(([time]) => time));
  return starts.flatMap((start, index) => {
    const factor = scale(index);
    const squeeze = spacing(starts, index, length);
    return pattern.map(([time, value, ramp]) =>
      ramp
        ? ([start + time * squeeze, value * factor, ramp] as const)
        : ([start + time * squeeze, value * factor] as const),
    );
  });
}

export function vowelSequence(
  pattern: readonly VowelStep[],
  starts: readonly number[],
): VowelStep[] {
  const length = Math.max(0, ...pattern.map(([time]) => time));
  return starts.flatMap((start, index) => {
    const squeeze = spacing(starts, index, length);
    return pattern.map(([time, vowel]) => [start + time * squeeze, vowel] as const);
  });
}

export function contourPeak(contour: Contour): number {
  if (typeof contour === 'number') return contour;
  return contour.reduce((peak, [, value]) => Math.max(peak, value), 0);
}

export function adsr(
  dur: number,
  { attack = 0.02, decay = 0, sustain = 1, release = 0.08, peak = 1 }: Adsr = {},
): Point[] {
  const a = Math.min(attack, dur * 0.5);
  const r = Math.min(release, dur - a);
  const d = Math.min(decay, Math.max(0, dur - a - r));
  const level = peak * sustain;
  const points: Point[] = [
    [0, 0],
    [a, peak],
  ];
  if (d > 0) points.push([a + d, level, 'exp']);
  points.push([dur - r, level], [dur, 0, 'exp']);
  return points;
}

export function pluck(dur: number, peak = 1, attack = 0.003): Point[] {
  return [
    [0, 0],
    [attack, peak],
    [dur, 0, 'exp'],
  ];
}

export function swellCurve(peakAt = 0.5, size = 128): Float32Array<ArrayBuffer> {
  const skew = Math.min(0.95, Math.max(0.05, peakAt));
  const curve = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const x = i / (size - 1);
    const phase = x < skew ? (x / skew) * 0.5 : 0.5 + ((x - skew) / (1 - skew)) * 0.5;
    curve[i] = Math.sin(Math.PI * phase) ** 2;
  }
  return curve;
}

export function vowelFormants(vowel: Vowel): readonly Formant[] {
  return typeof vowel === 'string' ? VOWELS[vowel] : vowel;
}

export function blend(from: Vowel, to: Vowel, mix: number): Formant[] {
  const a = vowelFormants(from);
  const b = vowelFormants(to);
  return a.map((fa, index) => {
    const fb = b[Math.min(index, b.length - 1)];
    return {
      freq: fa.freq * (fb.freq / fa.freq) ** mix,
      bw: fa.bw + (fb.bw - fa.bw) * mix,
      amp: fa.amp + (fb.amp - fa.amp) * mix,
    };
  });
}

function isVowelPath(path: VowelPath): path is readonly VowelStep[] {
  return typeof path !== 'string' && path.length > 0 && Array.isArray(path[0]);
}

function vowelSteps(path: VowelPath): readonly (readonly [number, readonly Formant[]])[] {
  if (isVowelPath(path)) return path.map(([time, vowel]) => [time, vowelFormants(vowel)] as const);
  return [[0, vowelFormants(path as Vowel)]];
}

function cacheFor<K, V>(store: WeakMap<BaseAudioContext, Map<K, V>>, ctx: BaseAudioContext) {
  let map = store.get(ctx);
  if (!map) {
    map = new Map();
    store.set(ctx, map);
  }
  return map;
}

const noiseStore = new WeakMap<BaseAudioContext, Map<string, AudioBuffer>>();
const waveStore = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>();
const impulseStore = new WeakMap<BaseAudioContext, Map<string, AudioBuffer>>();
const curveStore = new Map<string, Float32Array<ArrayBuffer>>();

const NOISE_SEEDS: Record<NoiseColor, number> = {
  white: 0x51f15e,
  pink: 0x9e3779b9,
  brown: 0xb5ad4ece,
};

function fillNoise(color: NoiseColor, length: number): Float32Array {
  const next = mulberry32(NOISE_SEEDS[color]);
  const data = new Float32Array(length);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  let brown = 0;
  for (let i = 0; i < length; i++) {
    const white = next() * 2 - 1;
    if (color === 'white') {
      data[i] = white;
    } else if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
    } else {
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown;
    }
  }
  return data;
}

function blockDc(data: Float32Array, sampleRate: number): void {
  const pole = 1 - (2 * Math.PI * 25) / sampleRate;
  let previousIn = 0;
  let previousOut = 0;
  for (let i = 0; i < data.length; i++) {
    const value = data[i] - previousIn + pole * previousOut;
    previousIn = data[i];
    previousOut = value;
    data[i] = value;
  }
}

function normalizeRms(data: Float32Array, target: number): void {
  let sum = 0;
  for (const value of data) sum += value * value;
  const rms = Math.sqrt(sum / data.length) || 1;
  const scale = target / rms;
  for (let i = 0; i < data.length; i++) data[i] = Math.max(-1, Math.min(1, data[i] * scale));
}

export function noiseBuffer(ctx: BaseAudioContext, color: NoiseColor): AudioBuffer {
  const cache = cacheFor(noiseStore, ctx);
  const cached = cache.get(color);
  if (cached) return cached;
  const length = Math.floor(ctx.sampleRate * NOISE_SECONDS);
  const fade = Math.floor(ctx.sampleRate * 0.02);
  const raw = fillNoise(color, length + fade);
  blockDc(raw, ctx.sampleRate);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const mix = i < fade ? i / fade : 1;
    data[i] = raw[i] * mix + (i < fade ? raw[length + i] * (1 - mix) : 0);
  }
  let mean = 0;
  for (const value of data) mean += value;
  mean /= length;
  for (let i = 0; i < length; i++) data[i] -= mean;
  normalizeRms(data, 0.25);
  cache.set(color, buffer);
  return buffer;
}

export function driftBuffer(ctx: BaseAudioContext): AudioBuffer {
  const cache = cacheFor(noiseStore, ctx);
  const cached = cache.get('drift');
  if (cached) return cached;
  const knots = DRIFT_SECONDS * DRIFT_KNOTS_PER_SECOND;
  const next = mulberry32(0xd71f7);
  const values = Array.from({ length: knots }, () => next() * 2 - 1);
  const length = Math.floor(ctx.sampleRate * DRIFT_SECONDS);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < length; i++) {
    const position = (i / length) * knots;
    const k = Math.floor(position);
    const f = position - k;
    const p0 = values[(k - 1 + knots) % knots];
    const p1 = values[k % knots];
    const p2 = values[(k + 1) % knots];
    const p3 = values[(k + 2) % knots];
    const value =
      0.5 *
      (2 * p1 +
        (-p0 + p2) * f +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f +
        (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    data[i] = value;
    peak = Math.max(peak, Math.abs(value));
  }
  for (let i = 0; i < length; i++) data[i] /= peak || 1;
  cache.set('drift', buffer);
  return buffer;
}

export function periodicWave(ctx: BaseAudioContext, wave: CustomWave | readonly number[]) {
  const cache = cacheFor(waveStore, ctx);
  const key = typeof wave === 'string' ? wave : wave.join(',');
  const cached = cache.get(key);
  if (cached) return cached;
  const amplitudes =
    typeof wave === 'string'
      ? Array.from({ length: HARMONIC_COUNT }, (_, i) => CUSTOM_SPECTRA[wave](i + 1))
      : wave;
  const real = new Float32Array(amplitudes.length + 1);
  const imag = new Float32Array(amplitudes.length + 1);
  amplitudes.forEach((amp, i) => {
    imag[i + 1] = amp;
  });
  const created = ctx.createPeriodicWave(real, imag);
  cache.set(key, created);
  return created;
}

export function driveCurve(amount: number): Float32Array<ArrayBuffer> {
  const key = amount.toFixed(3);
  const cached = curveStore.get(key);
  if (cached) return cached;
  const size = 2048;
  const curve = new Float32Array(size);
  const norm = Math.tanh(amount);
  for (let i = 0; i < size; i++) {
    const x = (i / (size - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * x) / norm;
  }
  curveStore.set(key, curve);
  return curve;
}

let limiterCurveCache: Float32Array<ArrayBuffer> | undefined;

export function limiterCurve(): Float32Array<ArrayBuffer> {
  if (limiterCurveCache) return limiterCurveCache;
  const size = 4096;
  const curve = new Float32Array(size);
  const headroom = LIMIT_CEILING - LIMIT_KNEE;
  for (let i = 0; i < size; i++) {
    const x = ((i / (size - 1)) * 2 - 1) * LIMIT_RANGE;
    const magnitude = Math.abs(x);
    const limited =
      magnitude < LIMIT_KNEE
        ? magnitude
        : LIMIT_KNEE + headroom * Math.tanh((magnitude - LIMIT_KNEE) / headroom);
    curve[i] = Math.sign(x) * limited;
  }
  limiterCurveCache = curve;
  return curve;
}

export function impulseResponse(ctx: BaseAudioContext, seconds: number, bright = 0.5) {
  const cache = cacheFor(impulseStore, ctx);
  const key = `${seconds.toFixed(3)}:${bright.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(seconds * rate));
  const buffer = ctx.createBuffer(2, length, rate);
  const fadeStart = length * 0.9;
  for (let channel = 0; channel < 2; channel++) {
    const next = mulberry32(0x7e7e7e + channel * 7919);
    const data = buffer.getChannelData(channel);
    let smooth = 0;
    let energy = 0;
    for (let i = 0; i < length; i++) {
      const progress = i / length;
      const decay = Math.exp(-6.9 * progress);
      const fade = i > fadeStart ? 1 - (i - fadeStart) / (length - fadeStart) : 1;
      const cutoff = bright * (1 - progress * 0.8) + 0.05;
      smooth += (next() * 2 - 1 - smooth) * Math.min(1, cutoff);
      const value = smooth * decay * fade * (i < rate * 0.004 ? i / (rate * 0.004) : 1);
      data[i] = value;
      energy += value * value;
    }
    const scale = 1 / Math.sqrt(energy || 1);
    for (let i = 0; i < length; i++) data[i] *= scale;
  }
  cache.set(key, buffer);
  return buffer;
}

function bandLevel(ctx: BaseAudioContext, freq: number, q: number): number {
  const bandwidth = Math.min(ctx.sampleRate / 2, freq / Math.max(0.1, q));
  return Math.min(12, 1 / (0.75 * Math.sqrt(bandwidth / (ctx.sampleRate / 2))));
}

function isCustomWave(wave: Wave): wave is CustomWave | readonly number[] {
  return typeof wave !== 'string' || wave in CUSTOM_SPECTRA;
}

export class Synth {
  readonly ctx: BaseAudioContext;
  readonly t0: number;
  readonly master: GainNode;
  private readonly voiceRand: () => number;
  private readonly scatter: () => number;
  private latest = 0;
  private tail = 0;

  constructor(voice: Voice, level = 1) {
    this.ctx = voice.ctx;
    this.t0 = voice.t0;
    this.voiceRand = voice.rand;
    this.scatter = mulberry32(Math.floor(voice.rand() * 4294967296));
    const limiter = this.ctx.createWaveShaper();
    limiter.curve = limiterCurve();
    limiter.oversample = '2x';
    limiter.connect(voice.out);
    this.master = this.gain(level / LIMIT_RANGE, { dest: limiter });
  }

  vary(spread = 0.05): number {
    return 1 + (this.voiceRand() * 2 - 1) * spread;
  }

  jitter(seconds: number): number {
    return (this.voiceRand() * 2 - 1) * seconds;
  }

  random(): number {
    return this.scatter();
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.scatter();
  }

  when(at = 0): number {
    return this.t0 + at;
  }

  done(extra = 0): number {
    return Math.ceil((this.latest + this.tail + extra) * 1000) / 1000;
  }

  private track(end: number): void {
    this.latest = Math.max(this.latest, end);
  }

  private play(node: AudioScheduledSourceNode, at: number, dur: number): void {
    const start = this.when(at);
    node.start(start);
    node.stop(start + dur);
    this.track(at + dur);
  }

  route(pan: Contour | undefined, at = 0, dest?: AudioNode): AudioNode {
    if (pan === undefined) return dest ?? this.master;
    return this.panner(pan, { at, dest });
  }

  bus(...dests: AudioNode[]): GainNode {
    const node = this.gain(1);
    for (const dest of dests.length > 0 ? dests : [this.master]) node.connect(dest);
    return node;
  }

  gain(value: Contour = 1, { at = 0, dest }: Routing = {}): GainNode {
    const node = this.ctx.createGain();
    automate(node.gain, this.when(at), value);
    if (dest) node.connect(dest);
    return node;
  }

  envelope(points: readonly Point[], peak = 1, { at = 0, dest }: Routing = {}): GainNode {
    return this.gain(scaleContour(points, peak), { at, dest: dest ?? this.master });
  }

  curve(param: AudioParam, values: Float32Array<ArrayBuffer>, { at = 0, dur }: Span): void {
    const start = this.when(at);
    const step = 1 / this.ctx.sampleRate;
    param.setValueAtTime(values[0], start);
    param.setValueCurveAtTime(values, start + step, Math.max(step, dur - step));
  }

  swell(dur: number, peak = 1, peakAt = 0.5, { at = 0, dest }: Routing = {}): GainNode {
    const node = this.ctx.createGain();
    this.curve(
      node.gain,
      swellCurve(peakAt).map((value) => value * peak),
      { at, dur },
    );
    node.connect(dest ?? this.master);
    return node;
  }

  filter(
    type: BiquadFilterType,
    freq: Contour,
    q: Contour = 1,
    { at = 0, dest, gain }: FilterOptions = {},
  ): BiquadFilterNode {
    const node = this.ctx.createBiquadFilter();
    node.type = type;
    automate(node.frequency, this.when(at), freq, 1, 'exp');
    automate(node.Q, this.when(at), q);
    if (gain !== undefined) node.gain.setValueAtTime(gain, this.when(at));
    if (dest) node.connect(dest);
    return node;
  }

  shaper(drive: number, dest?: AudioNode): WaveShaperNode {
    const node = this.ctx.createWaveShaper();
    node.curve = driveCurve(drive);
    node.oversample = '4x';
    if (dest) node.connect(dest);
    return node;
  }

  panner(pan: Contour, { at = 0, dest }: Routing = {}): StereoPannerNode {
    const node = this.ctx.createStereoPanner();
    automate(node.pan, this.when(at), pan);
    node.connect(dest ?? this.master);
    return node;
  }

  osc(
    wave: Wave,
    freq: Contour,
    { at = 0, dur, dest, scale = 1, ramp = 'exp', detune }: OscOptions,
  ) {
    const node = this.ctx.createOscillator();
    if (isCustomWave(wave)) node.setPeriodicWave(periodicWave(this.ctx, wave));
    else node.type = wave;
    automate(node.frequency, this.when(at), freq, scale, ramp);
    if (detune) node.detune.setValueAtTime(detune, this.when(at));
    node.connect(dest ?? this.master);
    this.play(node, at, dur);
    return node;
  }

  noise(color: NoiseColor, { at = 0, dur, dest, rate = 1 }: NoiseOptions) {
    const node = this.ctx.createBufferSource();
    node.buffer = noiseBuffer(this.ctx, color);
    node.loop = true;
    node.playbackRate.setValueAtTime(rate, this.when(at));
    node.connect(dest ?? this.master);
    const start = this.when(at);
    node.start(start, this.scatter() * NOISE_SECONDS * 0.9);
    node.stop(start + dur);
    this.track(at + dur);
    return node;
  }

  lfo(
    target: AudioParam | readonly AudioParam[],
    { rate, depth, at = 0, dur, wave = 'sine' }: LfoOptions,
  ): GainNode {
    const amount = this.gain(depth, { at });
    for (const param of Array.isArray(target) ? target : [target]) amount.connect(param);
    this.osc(wave, rate, { at, dur, dest: amount, ramp: 'lin' });
    return amount;
  }

  wander(
    target: AudioParam | readonly AudioParam[],
    { depth, rate = 1, at = 0, dur }: WanderOptions,
  ): GainNode {
    const amount = this.gain(depth, { at });
    for (const param of Array.isArray(target) ? target : [target]) amount.connect(param);
    const node = this.ctx.createBufferSource();
    node.buffer = driftBuffer(this.ctx);
    node.loop = true;
    node.playbackRate.setValueAtTime(rate, this.when(at));
    node.connect(amount);
    const start = this.when(at);
    node.start(start, this.scatter() * DRIFT_SECONDS * 0.9);
    node.stop(start + dur);
    this.track(at + dur);
    return amount;
  }

  vibrato(
    target: AudioParam | readonly AudioParam[],
    { rate, depth, delay = 0, at = 0, dur }: Vibrato & Span,
  ): GainNode {
    const fadeIn = Math.min(0.15, Math.max(0.01, dur - delay));
    return this.lfo(target, {
      rate,
      depth: [
        [0, 0],
        [delay, 0],
        [delay + fadeIn, depth],
      ],
      at,
      dur,
    });
  }

  tremolo({ rate, depth, at = 0, dur, dest, wave = 'sine' }: LfoOptions): GainNode {
    const node = this.gain(
      mapContour(depth, (d) => 1 - d / 2),
      { at, dest: dest ?? this.master },
    );
    this.lfo(node.gain, { rate, depth: scaleContour(depth, 0.5), at, dur, wave });
    return node;
  }

  formants(path: VowelPath, { at = 0, shift = 1, width = 1, dest }: FormantOptions = {}): GainNode {
    const input = this.gain(1);
    const output = this.gain(1, { dest: dest ?? this.master });
    const steps = vowelSteps(path);
    const count = Math.max(...steps.map(([, set]) => set.length));
    for (let k = 0; k < count; k++) {
      const pick = (set: readonly Formant[]) => set[Math.min(k, set.length - 1)];
      const freq: Point[] = steps.map(([time, set]) => [time, pick(set).freq * shift, 'exp']);
      const q: Point[] = steps.map(([time, set]) => [
        time,
        pick(set).freq / (pick(set).bw * width),
      ]);
      const polarity = k % 2 === 0 ? 1 : -1;
      const amp: Point[] = steps.map(([time, set]) => [time, pick(set).amp * polarity]);
      const level = this.gain(amp, { at, dest: output });
      input.connect(this.filter('bandpass', freq, q, { at, dest: level }));
    }
    return input;
  }

  reverb({ seconds = 1.6, wet = 0.3, bright = 0.5, dest }: ReverbOptions = {}): GainNode {
    const input = this.gain(1);
    const convolver = this.ctx.createConvolver();
    convolver.normalize = false;
    convolver.buffer = impulseResponse(this.ctx, seconds, bright);
    input.connect(convolver).connect(this.gain(wet, { dest: dest ?? this.master }));
    this.tail = Math.max(this.tail, seconds);
    return input;
  }

  echo({ time, feedback = 0.35, wet = 0.3, tone = 3000, dest }: EchoOptions): GainNode {
    const input = this.gain(1);
    const delay = this.ctx.createDelay(Math.max(1, time * 2));
    delay.delayTime.setValueAtTime(time, this.when());
    const loop = this.gain(feedback);
    const damp = this.filter('lowpass', tone, 0);
    input.connect(delay);
    delay.connect(damp).connect(loop).connect(delay);
    delay.connect(this.gain(wet, { dest: dest ?? this.master }));
    const repeats = Math.ceil(Math.log(0.001) / Math.log(Math.min(0.95, Math.max(0.01, feedback))));
    this.tail = Math.max(this.tail, time * (repeats + 1));
    return input;
  }

  note(o: NoteOptions): number {
    const at = o.at ?? 0;
    const out = this.route(o.pan, at, o.dest);
    const env =
      o.env ??
      adsr(o.dur, { attack: o.attack ?? 0.01, release: o.release ?? Math.min(0.1, o.dur / 2) });
    const amp = this.envelope(env, o.gain ?? 0.5, { at, dest: out });
    const target =
      o.lowpass !== undefined ? this.filter('lowpass', o.lowpass, 0, { at, dest: amp }) : amp;
    const node = this.osc(o.wave ?? 'sine', o.freq, {
      at,
      dur: o.dur + SOURCE_PAD,
      dest: target,
      scale: o.transpose,
    });
    if (o.vibrato) this.vibrato(node.detune, { ...o.vibrato, at, dur: o.dur + SOURCE_PAD });
    return at + o.dur;
  }

  vocal(o: VocalOptions): number {
    const at = o.at ?? 0;
    const transpose = o.transpose ?? 1;
    const sourceDur = o.dur + SOURCE_PAD;
    const wave = o.wave ?? 'pulse';
    const out = this.route(o.pan, at, o.dest);
    const env = o.env ?? adsr(o.dur, { attack: o.attack ?? 0.04, release: o.release ?? 0.1 });
    const amp = this.envelope(env, (o.gain ?? 0.5) * VOCAL_MAKEUP, { at, dest: out });
    const rough = o.growl ? this.roughen(o.growl, { at, dur: sourceDur, dest: amp }) : amp;
    const tone = this.filter('lowpass', o.tone ?? 6500, 0, { at, dest: rough });
    const width = o.width ?? Math.min(3.5, Math.max(1, (contourPeak(o.pitch) * transpose) / 250));
    const bank = this.formants(o.vowel, { at, shift: o.shift, width, dest: tone });
    const source = this.gain(1, { dest: o.drive ? this.shaper(o.drive, bank) : bank });
    if (o.body)
      source.connect(this.filter('lowpass', 900, 0, { dest: this.gain(o.body, { dest: tone }) }));
    const pitchParams = [
      this.osc(wave, o.pitch, { at, dur: sourceDur, dest: source, scale: transpose }).detune,
    ];
    if (o.sub) {
      const subLevel = this.gain(o.sub, { dest: source });
      pitchParams.push(
        this.osc(wave, o.pitch, { at, dur: sourceDur, dest: subLevel, scale: transpose / 2 })
          .detune,
      );
    }
    if (o.vibrato) this.vibrato(pitchParams, { ...o.vibrato, at, dur: sourceDur });
    const jitter = o.jitter ?? 8;
    if (jitter > 0) this.wander(pitchParams, { depth: jitter, at, dur: sourceDur });
    if (o.growl?.fry)
      this.lfo(pitchParams, { rate: o.growl.rate, depth: o.growl.fry, at, dur: sourceDur });
    if (o.breath)
      this.noise('pink', { at, dur: sourceDur, dest: this.gain(o.breath, { dest: bank }) });
    return at + o.dur;
  }

  private roughen(growl: Growl, { at = 0, dur, dest }: Span): GainNode {
    const node = this.tremolo({ rate: growl.rate, depth: growl.depth, at, dur, dest });
    this.wander(node.gain, { depth: growl.depth * 0.3, rate: 1.5, at, dur });
    return node;
  }

  chirp(o: ChirpOptions): number {
    const attack = o.attack ?? 0.005;
    return this.note({
      ...o,
      wave: o.wave ?? 'sine',
      env: [
        [0, 0],
        [attack, 1],
        [Math.max(attack, o.dur * 0.6), 0.7],
        [o.dur, 0, 'exp'],
      ],
    });
  }

  bubble({ at = 0, freq, rise = 1.8, dur = 0.07, gain = 0.3, dest, pan }: BubbleOptions): number {
    const out = this.route(pan, at, dest);
    const amp = this.envelope(pluck(dur, 1, 0.003), gain, { at, dest: out });
    this.osc(
      'sine',
      [
        [0, freq],
        [dur * 0.85, freq * rise, 'exp'],
      ],
      { at, dur: dur + SOURCE_PAD, dest: amp },
    );
    return at + dur;
  }

  click({
    at = 0,
    freq = 2500,
    q = 3,
    dur = 0.012,
    gain = 0.4,
    ring = 0,
    color = 'white',
    dest,
    pan,
  }: ClickOptions): number {
    const out = this.route(pan, at, dest);
    const noiseLevel = gain * (1 - ring) * bandLevel(this.ctx, freq, q);
    const amp = this.envelope(pluck(dur, 1, 0.0008), noiseLevel, { at, dest: out });
    this.noise(color, {
      at,
      dur: dur + SOURCE_PAD,
      dest: this.filter('bandpass', freq, q, { dest: amp }),
    });
    if (ring > 0) {
      const tone = this.envelope(pluck(dur, 1, 0.0005), gain * ring, { at, dest: out });
      this.osc('sine', freq, { at, dur: dur + SOURCE_PAD, dest: tone });
    }
    return at + dur;
  }

  clicks({
    at = 0,
    times,
    freq = 3000,
    gain = 0.3,
    q = 3,
    dur = 0.006,
    ring = 0,
    color = 'white',
    dest,
    pan,
  }: ClickTrainOptions): number {
    const out = this.route(pan, at, dest);
    const pick = (value: number | readonly number[], index: number) =>
      typeof value === 'number' ? value : value[index % value.length];
    const order = times.map((time, index) => ({ time, index })).sort((a, b) => a.time - b.time);
    const noiseEnv: Point[] = [[0, 0]];
    const ringEnv: Point[] = [[0, 0]];
    const pitch: Point[] = [[0, pick(freq, order[0]?.index ?? 0)]];
    let last = 0;
    for (const { time, index } of order) {
      const begin = Math.max(time, last);
      const level = pick(gain, index);
      const band = bandLevel(this.ctx, pick(freq, index), q);
      noiseEnv.push(
        [begin, 0, 'set'],
        [begin + 0.0006, level * (1 - ring) * band],
        [begin + dur, 0, 'exp'],
      );
      ringEnv.push([begin, 0, 'set'], [begin + 0.0004, level * ring], [begin + dur, 0, 'exp']);
      pitch.push([begin, pick(freq, index), 'set']);
      last = begin + dur;
    }
    const amp = this.gain(noiseEnv, { at, dest: out });
    const band = this.filter('bandpass', pitch, q, { at, dest: amp });
    this.noise(color, { at, dur: last + SOURCE_PAD, dest: band });
    if (ring > 0) {
      const tone = this.gain(ringEnv, { at, dest: out });
      this.osc('sine', pitch, { at, dur: last + SOURCE_PAD, dest: tone, ramp: 'set' });
    }
    return at + last;
  }

  thump({
    at = 0,
    from = 160,
    to = 55,
    dur = 0.18,
    gain = 0.5,
    thud = 0,
    dest,
    pan,
  }: ThumpOptions): number {
    const out = this.route(pan, at, dest);
    const amp = this.envelope(pluck(dur, 1, 0.004), gain, { at, dest: out });
    this.osc(
      'sine',
      [
        [0, from],
        [dur * 0.45, to, 'exp'],
      ],
      { at, dur: dur + SOURCE_PAD, dest: amp },
    );
    if (thud > 0) {
      const thudAmp = this.envelope(pluck(dur * 0.5, 1, 0.002), gain * thud, { at, dest: out });
      this.noise('brown', {
        at,
        dur: dur * 0.5 + SOURCE_PAD,
        dest: this.filter('lowpass', 700, 0, { dest: thudAmp }),
      });
    }
    return at + dur;
  }

  burst(o: BurstOptions): number {
    const at = o.at ?? 0;
    const out = this.route(o.pan, at, o.dest);
    const amp =
      o.swell !== undefined
        ? this.swell(o.dur, o.gain ?? 0.4, o.swell, { at, dest: out })
        : this.envelope(
            o.env ?? adsr(o.dur, { attack: o.attack ?? 0.005, release: o.release ?? o.dur * 0.6 }),
            o.gain ?? 0.4,
            { at, dest: out },
          );
    const shaped = this.filter(o.type ?? 'bandpass', o.freq, o.q ?? 1, { at, dest: amp });
    this.noise(o.color ?? 'white', { at, dur: o.dur + SOURCE_PAD, dest: shaped, rate: o.rate });
    return at + o.dur;
  }

  bell({
    at = 0,
    freq,
    dur,
    gain = 0.3,
    partials = BELL_PARTIALS,
    dest,
    pan,
  }: BellOptions): number {
    const out = this.route(pan, at, dest);
    for (const [ratio, amp, decay] of partials) {
      if (freq * ratio > this.ctx.sampleRate * 0.45) continue;
      const length = Math.max(0.02, dur * decay);
      const level = this.envelope(pluck(length, 1, 0.002), gain * amp, { at, dest: out });
      this.osc('sine', freq * ratio, { at, dur: length + SOURCE_PAD, dest: level });
    }
    return at + dur;
  }
}
