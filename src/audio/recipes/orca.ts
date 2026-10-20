import { Synth } from '../synth';
import type { Recipe } from '../types';

const orca: Recipe = (voice) => {
  const s = new Synth(voice, 1.33).stereo();
  const pitch = s.vary(0.05);
  const sea = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.35 }));
  [
    [0, 0.6, 1100, 1650, 1250, 1],
    [0.7, 0.45, 1300, 1900, 1400, 0.85],
  ].forEach(([at, dur, from, peak, to, level]) => {
    const pulse = s.tremolo({ rate: 85, depth: 0.6, at, dur: dur + 0.02, dest: sea });
    s.note({
      at,
      dur,
      freq: [
        [0, from * pitch],
        [dur * 0.45, peak * pitch],
        [dur, to * pitch],
      ],
      wave: [1, 0.45, 0.25, 0.12],
      vibrato: { rate: 5, depth: 30, delay: 0.1 },
      env: [
        [0, 0],
        [0.05, 0.9],
        [dur * 0.5, 1],
        [dur, 0, 'exp'],
      ],
      gain: 0.28 * level,
      dest: pulse,
    });
  });
  for (let i = 0; i < 4; i++) {
    s.bubble({
      at: 1.18 + i * 0.06 + s.range(0, 0.03),
      freq: s.range(450, 950),
      rise: 1.7,
      dur: 0.05,
      gain: s.range(0.1, 0.16),
      pan: s.range(-0.4, 0.4),
    });
  }
  return s.done();
};

export default orca;
