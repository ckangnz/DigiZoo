import { Synth } from '../synth';
import type { Recipe } from '../types';

const seagull: Recipe = (voice) => {
  const s = new Synth(voice, 0.374).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const shore = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.2, bright: 0.45 }));
  const throat = s.filter('highpass', 550, 0.7, { dest: shore });
  const long = 0.46;
  s.vocal({
    dur: long,
    pitch: [
      [0, 900],
      [0.06, 1350],
      [0.18, 1300],
      [long, 760],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.06, 'e'],
      [0.16, 'a'],
      [0.32, 'o'],
      [long, 'u'],
    ],
    wave: 'reed',
    shift: 1.35,
    breath: 0.22,
    growl: { rate: 50, depth: 0.2, fry: 25 },
    drive: 1.5,
    env: [
      [0, 0],
      [0.02, 1],
      [0.25, 0.85],
      [long, 0, 'exp'],
    ],
    tone: 5500,
    gain: 0.5,
    dest: throat,
  });
  [0.6, 0.8, 1.0].forEach((offset, index) => {
    const dur = index === 2 ? 0.22 : 0.16;
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 1000],
        [0.03, 1300],
        [dur, 880],
      ],
      transpose: pitch * [1.02, 1, 0.96][index],
      vowel: [
        [0, 'i'],
        [0.03, 'a'],
        [dur * 0.7, 'o'],
        [dur, 'u'],
      ],
      wave: 'reed',
      shift: 1.35,
      breath: 0.22,
      growl: { rate: 50, depth: 0.2, fry: 25 },
      drive: 1.5,
      env: [
        [0, 0],
        [0.015, 1],
        [dur * 0.6, 0.75],
        [dur, 0, 'exp'],
      ],
      tone: 5500,
      gain: 0.45,
      dest: throat,
    });
  });
  return s.done();
};

export default seagull;
