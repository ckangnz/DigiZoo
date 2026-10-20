import { Synth } from '../synth';
import type { Recipe } from '../types';

const buffalo: Recipe = (voice) => {
  const s = new Synth(voice, 0.4);
  const pitch = s.vary(0.05);
  const dur = 0.9 * s.vary(0.04);
  s.vocal({
    dur,
    pitch: [
      [0, 82],
      [0.25 * dur, 108],
      [0.6 * dur, 100],
      [dur, 72],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.15 * dur, 'u'],
      [0.35 * dur, 'a'],
      [0.7 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.75,
    sub: 0.4,
    drive: 2.5,
    growl: { rate: 18, depth: 0.45, fry: 30 },
    jitter: 20,
    breath: 0.25,
    tone: 2400,
    env: [
      [0, 0],
      [0.15 * dur, 0.8],
      [0.35 * dur, 1],
      [0.75 * dur, 0.75],
      [dur, 0, 'exp'],
    ],
    gain: 0.55,
  });
  const snortAt = dur + 0.12;
  const flutter = s.tremolo({ rate: 26, depth: 0.7, at: snortAt, dur: 0.26 });
  s.burst({
    at: snortAt,
    dur: 0.24,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1400],
      [0.24, 450],
    ],
    q: 2,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.65],
      [0.24, 0, 'exp'],
    ],
    gain: 2.2,
    dest: flutter,
  });
  return s.done();
};

export default buffalo;
