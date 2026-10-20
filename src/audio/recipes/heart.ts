import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const heart: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  [0, 0.72].forEach((beat, index) => {
    const at = beat * pace;
    const level = index === 0 ? 1 : 0.88;
    [
      [0, 260, 95, 0.17, 400, 220, 0.55],
      [0.2, 300, 110, 0.13, 480, 270, 0.42],
    ].forEach(([offset, from, to, dur, high, low, gain]) => {
      const start = at + offset;
      s.thump({
        at: start,
        from: from * pitch,
        to: to * pitch,
        dur,
        gain: gain * level * 0.45,
        thud: 0.25,
      });
      s.note({
        at: start,
        dur,
        freq: [
          [0, high * pitch],
          [dur, low * pitch],
        ],
        wave: [1, 0.3, 0.1],
        env: pluck(dur, 1, 0.008),
        gain: gain * level * 0.7,
      });
      s.burst({
        at: start,
        dur: 0.09,
        color: 'pink',
        type: 'lowpass',
        freq: 750,
        q: 1,
        env: [
          [0, 0],
          [0.01, 1],
          [0.09, 0, 'exp'],
        ],
        gain: gain * level * 1.4,
      });
    });
  });
  return s.done();
};

export default heart;
