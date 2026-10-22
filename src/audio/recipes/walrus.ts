import { Synth } from '../synth';
import type { Recipe } from '../types';

const walrus: Recipe = (voice) => {
  const s = new Synth(voice, 0.416);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const lips = s.tremolo({ rate: 30, depth: 0.8, dur: 0.2 });
  s.burst({
    dur: 0.18,
    color: 'pink',
    freq: 600,
    q: 1.2,
    env: [
      [0, 0],
      [0.02, 1],
      [0.07, 0.7],
      [0.18, 0, 'exp'],
    ],
    gain: 1.2,
    dest: lips,
  });
  const dur = 0.85;
  s.vocal({
    at: 0.26 * pace,
    dur,
    pitch: [
      [0, 95],
      [0.15, 135],
      [0.5, 125],
      [dur, 85],
    ],
    transpose: pitch,
    vowel: [
      [0, 'o'],
      [0.15, 'a'],
      [0.55, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.8,
    sub: 0.35,
    drive: 2.5,
    growl: { rate: 18, depth: 0.5, fry: 30 },
    jitter: 20,
    breath: 0.4,
    env: [
      [0, 0],
      [0.08, 0.8],
      [0.25, 1],
      [0.65, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 2500,
    gain: 0.5,
  });
  [1.22, 1.42].forEach((offset, index) => {
    const at = offset * pace;
    s.vocal({
      at,
      dur: 0.13,
      pitch: [
        [0, 115],
        [0.04, 125],
        [0.13, 95],
      ],
      transpose: pitch * (index === 0 ? 1 : 0.94),
      vowel: [
        [0, 'o'],
        [0.04, 'a'],
        [0.13, 'u'],
      ],
      wave: 'buzz',
      shift: 0.8,
      sub: 0.3,
      drive: 2,
      growl: { rate: 20, depth: 0.5, fry: 25 },
      breath: 0.35,
      env: [
        [0, 0],
        [0.015, 1],
        [0.13, 0, 'exp'],
      ],
      tone: 2200,
      gain: 0.45,
    });
  });
  return s.done();
};

export default walrus;
