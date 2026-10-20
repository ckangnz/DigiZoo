import { Synth, pluck } from '../synth';
import type { Recipe } from '../types';

const tiger: Recipe = (voice) => {
  const s = new Synth(voice, 0.41);
  const pitch = s.vary(0.05);
  const dur = 0.95 * s.vary(0.04);
  s.vocal({
    dur,
    pitch: [
      [0, 92],
      [0.2 * dur, 150],
      [0.5 * dur, 138],
      [dur, 85],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.12 * dur, 'a'],
      [0.6 * dur, 'a'],
      [dur, 'o'],
    ],
    wave: 'buzz',
    shift: 0.75,
    sub: 0.4,
    drive: 3.5,
    growl: { rate: 24, depth: 0.55, fry: 50 },
    jitter: 30,
    breath: 0.3,
    tone: [
      [0, 1500],
      [0.25 * dur, 3000],
      [dur, 1500],
    ],
    env: [
      [0, 0],
      [0.08 * dur, 0.7],
      [0.25 * dur, 1],
      [0.7 * dur, 0.7],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
  });
  [dur + 0.12, dur + 0.4].forEach((at, index) => {
    const flutter = s.tremolo({ rate: 24, depth: 0.9, at, dur: 0.26 });
    s.burst({
      at,
      dur: 0.24,
      color: 'pink',
      freq: [
        [0, 950],
        [0.24, 480],
      ],
      q: 0.7,
      env: [
        [0, 0],
        [0.02, 1],
        [0.1, 0.7],
        [0.24, 0, 'exp'],
      ],
      gain: index === 0 ? 3.4 : 2.8,
      dest: flutter,
    });
    s.vocal({
      at,
      dur: 0.2,
      pitch: 85,
      transpose: pitch,
      vowel: 'n',
      wave: 'glottal',
      env: pluck(0.2, 1, 0.02),
      gain: 0.2,
      dest: flutter,
    });
  });
  return s.done();
};

export default tiger;
