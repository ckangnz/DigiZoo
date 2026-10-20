import { Synth } from '../synth';
import type { Recipe } from '../types';

const cow: Recipe = (voice) => {
  const s = new Synth(voice, 0.35);
  const pitch = s.vary(0.05);
  const dur = 1.5 * s.vary(0.04);
  s.vocal({
    dur,
    pitch: [
      [0, 116],
      [0.32 * dur, 152],
      [0.62 * dur, 144],
      [dur, 108],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.16 * dur, 'n'],
      [0.3 * dur, 'u'],
      [0.48 * dur, 'o'],
      [0.75 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.85,
    breath: 0.08,
    vibrato: { rate: 4.5, depth: 12, delay: 0.4 },
    jitter: 12,
    env: [
      [0, 0],
      [0.15 * dur, 0.75],
      [0.4 * dur, 1],
      [0.75 * dur, 0.85],
      [0.9 * dur, 0.45],
      [dur, 0, 'exp'],
    ],
    drive: 1.5,
    body: 0.05,
    tone: 3200,
    gain: 0.6,
  });
  return s.done();
};

export default cow;
