import { Synth } from '../synth';
import type { Recipe } from '../types';

const oryx: Recipe = (voice) => {
  const s = new Synth(voice, 0.4);
  const pitch = s.vary(0.05);
  const flutter = s.tremolo({ rate: 24, depth: 0.6, dur: 0.24 });
  s.burst({
    dur: 0.22,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1500],
      [0.22, 500],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.6],
      [0.22, 0, 'exp'],
    ],
    gain: 2.2,
    dest: flutter,
  });
  const dur = 0.6;
  s.vocal({
    at: 0.3,
    dur,
    pitch: [
      [0, 120],
      [0.12, 140],
      [dur, 105],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.1, 'o'],
      [0.45, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.8,
    sub: 0.3,
    growl: { rate: 20, depth: 0.45, fry: 25 },
    breath: 0.2,
    env: [
      [0, 0],
      [0.06, 0.9],
      [0.15, 1],
      [0.45, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 2200,
    gain: 0.55,
  });
  [1.0, 1.14].forEach((at) => {
    s.click({ at, freq: 1400 * pitch, q: 6, dur: 0.03, gain: 0.8, ring: 0.5 });
    s.thump({ at, from: 220, to: 120, dur: 0.06, gain: 0.5 });
  });
  return s.done();
};

export default oryx;
