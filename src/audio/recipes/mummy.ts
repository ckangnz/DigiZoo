import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const mummy: Recipe = (voice) => {
  const s = new Synth(voice, 0.62);
  const pitch = s.vary(0.05);
  const hum = blend('n', 'u', 0.3);
  [
    [0, 0.22, 200, 215, 190, 1],
    [0.3, 0.5, 190, 250, 205, 0.95],
  ].forEach(([at, dur, from, peak, to, level]) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, from],
        [dur * 0.4, peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: hum,
      wave: 'buzz',
      breath: 0.15,
      growl: { rate: 18, depth: 0.2 },
      env: [
        [0, 0],
        [0.04, 1],
        [dur * 0.7, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 1300,
      gain: 0.5 * level,
    });
  });
  s.vocal({
    at: 0.92,
    dur: 0.32,
    pitch: [
      [0, 240],
      [0.1, 210],
      [0.32, 180],
    ],
    transpose: pitch,
    vowel: hum,
    wave: 'buzz',
    breath: 0.15,
    env: [
      [0, 0],
      [0.04, 1],
      [0.2, 0.8],
      [0.32, 0, 'exp'],
    ],
    tone: 1200,
    gain: 0.4,
  });
  s.burst({
    at: 0.6,
    dur: 0.3,
    color: 'pink',
    freq: 2500,
    q: 0.8,
    env: [
      [0, 0],
      [0.1, 1],
      [0.3, 0, 'exp'],
    ],
    gain: 0.25,
  });
  return s.done();
};

export default mummy;
