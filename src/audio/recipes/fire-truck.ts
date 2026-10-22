import { Synth } from '../synth';
import type { Recipe } from '../types';

const fireTruck: Recipe = (voice) => {
  const s = new Synth(voice, 0.864).stereo();
  const pitch = s.vary(0.02);
  const street = s.bus(s.master, s.reverb({ seconds: 0.25, wet: 0.18, bright: 0.4 }));
  [
    [0, 0.22],
    [0.3, 0.42],
  ].forEach(([at, dur]) => {
    [233, 294].forEach((base, index) => {
      const f = base * pitch;
      s.note({
        at,
        dur,
        freq: [
          [0, f * 0.92],
          [0.04, f],
        ],
        wave: 'reed',
        env: [
          [0, 0],
          [0.02, 1],
          [dur - 0.06, 0.85],
          [dur, 0, 'exp'],
        ],
        lowpass: 1800,
        gain: index === 0 ? 0.26 : 0.2,
        dest: street,
      });
    });
  });
  const at = 0.82;
  const dur = 0.95;
  const rotor = s.tremolo({ rate: 30, depth: 0.2, at, dur: dur + 0.02, dest: street });
  s.note({
    at,
    dur,
    freq: [
      [0, 300 * pitch],
      [0.55, 950 * pitch],
      [dur, 820 * pitch],
    ],
    wave: 'hollow',
    env: [
      [0, 0],
      [0.3, 0.8],
      [0.6, 1],
      [dur, 0, 'exp'],
    ],
    lowpass: 2500,
    gain: 0.3,
    dest: rotor,
  });
  s.burst({
    at,
    dur,
    color: 'pink',
    freq: [
      [0, 600],
      [0.55, 1600],
      [dur, 1300],
    ],
    q: 1.5,
    swell: 0.6,
    gain: 0.12,
    dest: rotor,
  });
  return s.done();
};

export default fireTruck;
