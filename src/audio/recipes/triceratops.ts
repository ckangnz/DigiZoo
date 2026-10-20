import { Synth, blend } from '../synth';
import type { Recipe } from '../types';

const triceratops: Recipe = (voice) => {
  const s = new Synth(voice, 0.41);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const flutter = s.tremolo({ rate: 28, depth: 0.7, dur: 0.3 });
  s.burst({
    dur: 0.28,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1500],
      [0.28, 500],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.7],
      [0.28, 0, 'exp'],
    ],
    gain: 2.4,
    dest: flutter,
  });
  const dur = 0.75;
  const round = blend('o', 'u', 0.4);
  s.vocal({
    at: 0.36 * pace,
    dur,
    pitch: [
      [0, 85],
      [0.2, 105],
      [0.55, 100],
      [dur, 75],
    ],
    transpose: pitch,
    vowel: [
      [0, round],
      [0.2, 'o'],
      [0.6, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.7,
    sub: 0.4,
    drive: 2,
    growl: { rate: 20, depth: 0.4, fry: 25 },
    breath: 0.25,
    tone: 2000,
    env: [
      [0, 0],
      [0.1, 0.85],
      [0.25, 1],
      [0.6, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.55,
  });
  [1.16, 1.32].forEach((offset) => {
    s.stomp({ at: offset * pace, freq: 75, dur: 0.3, gain: 1.0 });
  });
  return s.done();
};

export default triceratops;
