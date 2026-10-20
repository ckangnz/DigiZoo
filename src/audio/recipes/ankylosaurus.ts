import { Synth, WOOD_PARTIALS, blend } from '../synth';
import type { Recipe } from '../types';

const ankylosaurus: Recipe = (voice) => {
  const s = new Synth(voice, 0.45);
  const pitch = s.vary(0.05);
  s.vocal({
    dur: 0.32,
    pitch: [
      [0, 110],
      [0.08, 125],
      [0.32, 90],
    ],
    transpose: pitch,
    vowel: blend('a', 'o', 0.5),
    wave: 'buzz',
    shift: 0.7,
    sub: 0.3,
    growl: { rate: 22, depth: 0.4, fry: 20 },
    breath: 0.2,
    env: [
      [0, 0],
      [0.03, 1],
      [0.15, 0.8],
      [0.32, 0, 'exp'],
    ],
    tone: 2600,
    gain: 0.75,
  });
  s.burst({
    at: 0.4,
    dur: 0.28,
    color: 'pink',
    freq: [
      [0, 400],
      [0.18, 1400],
      [0.28, 600],
    ],
    q: 1.3,
    swell: 0.6,
    gain: 1.2,
  });
  const bonk = 0.68;
  s.mallet({
    at: bonk,
    freq: 210 * pitch,
    dur: 0.35,
    gain: 0.8,
    partials: WOOD_PARTIALS,
    hit: 0.4,
  });
  s.thump({ at: bonk, from: 240 * pitch, to: 90 * pitch, dur: 0.2, gain: 0.4, thud: 0.6 });
  s.click({ at: bonk, freq: 1300, q: 3, dur: 0.02, gain: 0.7, ring: 0.3 });
  s.spring({
    at: bonk + 0.08,
    dur: 0.4,
    freq: [
      [0, 260 * pitch],
      [0.05, 330 * pitch],
      [0.4, 340 * pitch],
    ],
    depth: 300,
    gain: 0.45,
  });
  return s.done();
};

export default ankylosaurus;
