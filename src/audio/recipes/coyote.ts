import { Synth } from '../synth';
import type { Recipe } from '../types';

const coyote: Recipe = (voice) => {
  const s = new Synth(voice, 0.82).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const desert = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.25, bright: 0.4 }));
  [0, 0.16].forEach((offset, index) => {
    const dur = 0.09;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 720],
        [0.02, 920],
        [dur, 760],
      ],
      transpose: pitch * (index === 0 ? 1 : 1.06),
      vowel: [
        [0, 'i'],
        [0.03, 'a'],
        [dur, 'e'],
      ],
      shift: 1.3,
      breath: 0.3,
      env: [
        [0, 0],
        [0.01, 1],
        [0.05, 0.6],
        [dur, 0, 'exp'],
      ],
      tone: 6000,
      gain: 0.5,
      dest: desert,
    });
  });
  const dur = 0.9;
  s.vocal({
    at: 0.38 * pace,
    dur,
    pitch: [
      [0, 480],
      [0.2, 760],
      [0.55, 800],
      [dur, 560],
    ],
    transpose: pitch,
    vowel: [
      [0, 'a'],
      [0.2, 'o'],
      [0.6, 'u'],
      [dur, 'u'],
    ],
    shift: 1.15,
    breath: 0.25,
    vibrato: { rate: 6, depth: 35, delay: 0.25 },
    env: [
      [0, 0],
      [0.12, 0.8],
      [0.3, 1],
      [0.7, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 5000,
    gain: 0.45,
    dest: desert,
  });
  return s.done();
};

export default coyote;
