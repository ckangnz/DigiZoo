import { Synth } from '../synth';
import type { Recipe } from '../types';

const tRex: Recipe = (voice) => {
  const s = new Synth(voice, 0.35).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.2, bright: 0.3 }));
  [0, 0.32].forEach((offset, index) => {
    s.stomp({ at: offset * pace, freq: 65, dur: 0.35, gain: index === 0 ? 1.1 : 1.25, dest: cave });
  });
  const dur = 0.95;
  s.vocal({
    at: 0.62 * pace,
    dur,
    pitch: [
      [0, 120],
      [0.15 * dur, 175],
      [0.45 * dur, 160],
      [0.8 * dur, 120],
      [dur, 95],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.15 * dur, 'a'],
      [0.6 * dur, 'a'],
      [0.85 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.72,
    sub: 0.35,
    drive: 2.5,
    growl: { rate: 26, depth: 0.45, fry: 35 },
    jitter: 20,
    breath: 0.35,
    tone: [
      [0, 1500],
      [0.2 * dur, 3200],
      [dur, 1200],
    ],
    env: [
      [0, 0],
      [0.08 * dur, 0.75],
      [0.2 * dur, 1],
      [0.6 * dur, 0.85],
      [0.85 * dur, 0.4],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
    dest: cave,
  });
  return s.done();
};

export default tRex;
