import { Synth } from '../synth';
import type { Recipe } from '../types';

const seahorse: Recipe = (voice) => {
  const s = new Synth(voice, 1.2).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const water = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.4 }));
  const gallop = [0, 0.08, 0.2, 0.28, 0.4, 0.48].map((t) => t * pace);
  s.clicks({
    times: gallop,
    freq: gallop.map((_, i) => (i % 2 === 0 ? 2300 : 1900) * pitch),
    gain: gallop.map((_, i) => (i % 2 === 0 ? 0.35 : 0.28)),
    q: 7,
    dur: 0.02,
    ring: 0.5,
    dest: water,
  });
  const neighAt = 0.62 * pace;
  const dur = 0.55;
  s.vocal({
    at: neighAt,
    dur,
    pitch: [
      [0, 1050],
      [0.08, 1500],
      [0.25, 1400],
      [dur, 950],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.18, 'e'],
      [0.4, 'a'],
      [dur, 'o'],
    ],
    shift: 1.6,
    breath: 0.15,
    vibrato: { rate: 10, depth: 110, delay: 0.06 },
    growl: { rate: 10, depth: 0.4 },
    env: [
      [0, 0],
      [0.03, 0.9],
      [0.1, 1],
      [0.4, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 7000,
    gain: 0.4,
    dest: water,
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: neighAt + dur + 0.02 + i * 0.07,
      freq: s.range(600, 1200),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.12, 0.2),
      pan: s.range(-0.4, 0.4),
    });
  }
  return s.done();
};

export default seahorse;
