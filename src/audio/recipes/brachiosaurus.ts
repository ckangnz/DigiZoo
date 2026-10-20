import { Synth } from '../synth';
import type { Recipe } from '../types';

const brachiosaurus: Recipe = (voice) => {
  const s = new Synth(voice, 0.32).stereo();
  const pitch = s.vary(0.04);
  const valley = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.3 }));
  s.stomp({ freq: 50, dur: 0.55, gain: 1.4, dest: valley });
  const dur = 1.15;
  s.vocal({
    at: 0.35,
    dur,
    pitch: [
      [0, 72],
      [0.35, 98],
      [0.8, 92],
      [dur, 70],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.3, 'o'],
      [0.8, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.65,
    sub: 0.5,
    drive: 1.5,
    vibrato: { rate: 4, depth: 20, delay: 0.3 },
    breath: 0.15,
    jitter: 10,
    env: [
      [0, 0],
      [0.25, 0.85],
      [0.5, 1],
      [0.85, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 1400,
    gain: 0.55,
    dest: valley,
  });
  return s.done();
};

export default brachiosaurus;
