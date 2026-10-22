import { Synth } from '../synth';
import type { Recipe } from '../types';

const boat: Recipe = (voice) => {
  const s = new Synth(voice, 1.64).stereo();
  const pitch = s.vary(0.03);
  const harbor = s.bus(s.master, s.reverb({ seconds: 0.6, wet: 0.3, bright: 0.35 }));
  const horn = s.filter('peaking', 450, 1.2, { dest: harbor, gain: 6 });
  [
    [0, 0.4],
    [0.55, 0.85],
  ].forEach(([at, dur]) => {
    [130, 164].forEach((base, index) => {
      const f = base * pitch;
      s.note({
        at,
        dur,
        freq: [
          [0, f * 0.94],
          [0.08, f],
        ],
        wave: 'reed',
        env: [
          [0, 0],
          [0.08, 1],
          [dur - 0.15, 0.9],
          [dur, 0, 'exp'],
        ],
        lowpass: 1300,
        gain: index === 0 ? 0.3 : 0.22,
        dest: horn,
      });
    });
  });
  s.burst({
    dur: 1.4,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 400],
      [0.7, 700],
      [1.4, 450],
    ],
    q: 1,
    swell: 0.5,
    gain: 0.12,
    pan: [
      [0, -0.3],
      [1.4, 0.3],
    ],
  });
  return s.done();
};

export default boat;
