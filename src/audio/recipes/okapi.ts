import { Synth } from '../synth';
import type { Recipe } from '../types';

const okapi: Recipe = (voice) => {
  const s = new Synth(voice, 0.78);
  const pitch = s.vary(0.05);
  [0, 0.2].forEach((at, index) => {
    s.click({ at, freq: 1300 * pitch, q: 6, dur: 0.03, gain: 0.35, ring: 0.5 });
    s.click({ at: at + 0.004, freq: 2600, q: 2, dur: 0.008, gain: 0.15 });
    s.thump({ at, from: 220, to: 120, dur: 0.06, gain: index === 0 ? 0.25 : 0.2 });
  });
  const dur = 0.75;
  s.vocal({
    at: 0.42,
    dur,
    pitch: [
      [0, 210],
      [0.15, 260],
      [0.5, 240],
      [dur, 190],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.1, 'u'],
      [0.25, 'a'],
      [0.55, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.95,
    breath: 0.2,
    vibrato: { rate: 5, depth: 25, delay: 0.2 },
    env: [
      [0, 0],
      [0.08, 0.8],
      [0.25, 1],
      [0.55, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 2800,
    gain: 0.4,
  });
  return s.done();
};

export default okapi;
