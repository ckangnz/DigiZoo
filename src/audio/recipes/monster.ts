import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const monster: Recipe = (voice) => {
  const s = new Synth(voice, 0.53);
  const pitch = s.vary(0.05);
  const uh = blend('a', 'o', 0.4);
  s.vocal({
    dur: 0.2,
    pitch: [
      [0, 150],
      [0.05, 160],
      [0.2, 125],
    ],
    transpose: pitch,
    vowel: uh,
    wave: 'buzz',
    shift: 0.85,
    sub: 0.3,
    growl: { rate: 22, depth: 0.3, fry: 20 },
    breath: 0.15,
    env: [
      [0, 0],
      [0.02, 1],
      [0.12, 0.8],
      [0.2, 0, 'exp'],
    ],
    tone: 2600,
    gain: 0.5,
  });
  s.burst({ at: 0.27, dur: 0.06, color: 'pink', freq: 1200, q: 0.8, gain: 0.25 });
  s.vocal({
    at: 0.3,
    dur: 0.42,
    pitch: [
      [0, 125],
      [0.12, 150],
      [0.3, 185],
      [0.42, 175],
    ],
    transpose: pitch,
    vowel: [
      [0, uh],
      [0.3, 'a'],
      [0.42, uh],
    ],
    wave: 'buzz',
    shift: 0.85,
    sub: 0.3,
    growl: { rate: 22, depth: 0.3, fry: 20 },
    breath: 0.2,
    env: [
      [0, 0],
      [0.03, 1],
      [0.3, 0.9],
      [0.42, 0, 'exp'],
    ],
    tone: 2800,
    gain: 0.5,
  });
  s.spring({
    at: 0.78,
    dur: 0.3,
    freq: [
      [0, 220 * pitch],
      [0.05, 300 * pitch],
      [0.3, 320 * pitch],
    ],
    depth: 300,
    gain: 0.16,
  });
  return s.done();
};

export default monster;
