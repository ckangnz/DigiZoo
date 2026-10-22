import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const bear: Recipe = (voice) => {
  const s = new Synth(voice, 0.422);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.12].forEach((offset, index) => {
    s.burst({
      at: offset * pace,
      dur: 0.07,
      color: 'pink',
      freq: 2200,
      q: 1.2,
      env: [
        [0, 0],
        [0.012, 1],
        [0.07, 0, 'exp'],
      ],
      gain: index === 0 ? 0.4 : 0.5,
    });
  });
  const dur = 1.1 * s.vary(0.03);
  s.vocal({
    at: 0.32 * pace,
    dur,
    pitch: [
      [0, 85],
      [0.15 * dur, 130],
      [0.45 * dur, 125],
      [0.8 * dur, 90],
      [dur, 70],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.12 * dur, 'o'],
      [0.4 * dur, blend('o', 'a', 0.6)],
      [0.8 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.8,
    sub: 0.35,
    drive: 2.5,
    growl: { rate: 20, depth: 0.55, fry: 40 },
    jitter: 25,
    breath: 0.5,
    tone: [
      [0, 1500],
      [0.3 * dur, 3000],
      [dur, 1200],
    ],
    env: [
      [0, 0],
      [0.08 * dur, 0.7],
      [0.25 * dur, 1],
      [0.7 * dur, 0.75],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  return s.done();
};

export default bear;
