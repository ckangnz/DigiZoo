import { Synth } from '../synth';
import type { Recipe } from '../types';

const horse: Recipe = (voice) => {
  const s = new Synth(voice, 1.25);
  const pitch = s.vary(0.05);
  const dur = 1.15 * s.vary(0.04);
  s.burst({ dur: 0.08, color: 'pink', freq: 1500, q: 1, gain: 0.12 });
  s.vocal({
    at: 0.03,
    dur,
    pitch: [
      [0, 650],
      [0.1, 990],
      [0.3 * dur, 910],
      [0.7 * dur, 680],
      [dur, 400],
    ],
    transpose: pitch,
    vowel: [
      [0, 'i'],
      [0.25 * dur, 'e'],
      [0.65 * dur, 'a'],
      [dur, 'o'],
    ],
    shift: 1.1,
    breath: 0.15,
    vibrato: { rate: 9, depth: 120, delay: 0.08 },
    growl: { rate: 9, depth: 0.55 },
    env: [
      [0, 0],
      [0.05, 0.9],
      [0.15, 1],
      [0.75 * dur, 0.7],
      [dur, 0, 'exp'],
    ],
    tone: 6000,
    gain: 0.45,
  });
  const snortAt = dur + 0.15;
  const flutter = s.tremolo({ rate: 26, depth: 0.7, at: snortAt, dur: 0.34 });
  s.burst({
    at: snortAt,
    dur: 0.3,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 1500],
      [0.3, 500],
    ],
    q: 3,
    env: [
      [0, 0],
      [0.015, 1],
      [0.1, 0.7],
      [0.3, 0, 'exp'],
    ],
    gain: 0.9,
    dest: flutter,
  });
  return s.done();
};

export default horse;
