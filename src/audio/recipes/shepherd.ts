import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const TUNE: readonly (readonly [at: number, note: number, dur: number])[] = [
  [0, 74, 0.15],
  [0.16, 76, 0.15],
  [0.32, 78, 0.15],
  [0.48, 81, 0.28],
  [0.78, 78, 0.15],
  [0.94, 76, 0.15],
  [1.1, 74, 0.4],
];

const shepherd: Recipe = (voice) => {
  const s = new Synth(voice, 1.05).stereo();
  const pitch = s.vary(0.02);
  const hills = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.3, bright: 0.45 }));
  TUNE.forEach(([at, note, dur]) => {
    const freq = midiHz(note) * pitch;
    s.note({
      at,
      dur,
      freq: [
        [0, freq * 0.98],
        [0.03, freq],
      ],
      wave: [1, 0.22, 0.06, 0.03],
      vibrato: { rate: 5.5, depth: 15, delay: 0.08 },
      env: [
        [0, 0],
        [0.025, 1],
        [dur * 0.5, 0.65],
        [dur, 0, 'exp'],
      ],
      gain: 0.28,
      dest: hills,
    });
    s.burst({
      at,
      dur: 0.05,
      color: 'white',
      freq: freq * 2,
      q: 2,
      env: [
        [0, 0],
        [0.005, 1],
        [0.05, 0, 'exp'],
      ],
      gain: 0.05,
      dest: hills,
    });
  });
  s.burst({
    dur: 1.5,
    color: 'pink',
    freq: 2500 * pitch,
    q: 0.8,
    env: [
      [0, 0],
      [0.1, 1],
      [1.3, 0.8],
      [1.5, 0, 'exp'],
    ],
    gain: 0.025,
    dest: hills,
  });
  return s.done();
};

export default shepherd;
