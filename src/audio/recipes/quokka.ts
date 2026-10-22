import { Synth } from '../synth';
import type { Recipe } from '../types';

const SQUEAKS: readonly (readonly [
  at: number,
  dur: number,
  from: number,
  peak: number,
  to: number,
])[] = [
  [0, 0.09, 880, 1120, 1000],
  [0.15, 0.09, 920, 1160, 1040],
  [0.3, 0.18, 900, 1250, 1350],
];

const quokka: Recipe = (voice) => {
  const s = new Synth(voice, 0.953);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  SQUEAKS.forEach(([offset, dur, from, peak, to]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, from],
        [Math.min(0.06, dur * 0.35), peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: [
        [0, 'i'],
        [dur * 0.5, 'e'],
        [dur, 'i'],
      ],
      shift: 1.5,
      breath: 0.3,
      env: [
        [0, 0],
        [0.01, 1],
        [dur * 0.6, 0.7],
        [dur, 0, 'exp'],
      ],
      tone: 7000,
      gain: 0.45,
    });
  });
  const hop = 0.7 * pace;
  s.thump({ at: hop, from: 170, to: 80, dur: 0.12, gain: 0.2, thud: 0.6 });
  s.burst({
    at: hop,
    dur: 0.07,
    color: 'pink',
    freq: 900,
    q: 0.9,
    env: [
      [0, 0],
      [0.005, 1],
      [0.07, 0, 'exp'],
    ],
    gain: 0.3,
  });
  [0.96, 1.1].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.09,
      pitch: [
        [0, 320],
        [0.09, 290],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.08),
      vowel: 'n',
      wave: 'glottal',
      breath: 0.15,
      env: [
        [0, 0],
        [0.015, 1],
        [0.09, 0, 'exp'],
      ],
      tone: 3000,
      gain: 0.06,
    });
  });
  return s.done();
};

export default quokka;
