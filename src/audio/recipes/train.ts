import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const GAPS = [0.13, 0.13, 0.12, 0.12, 0.11, 0.11, 0.1];
const ACCENTS = [0.7, 0.55, 0.8, 0.6, 0.9, 0.65, 1, 0.7];
const CHIME = [72, 76, 79];

const train: Recipe = (voice) => {
  const s = new Synth(voice, 1.18).stereo();
  const pitch = s.vary(0.02);
  const pace = s.vary(0.03);
  const track = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.2, bright: 0.45 }));
  let at = 0;
  for (let i = 0; i <= GAPS.length; i++) {
    const accent = ACCENTS[i];
    s.burst({
      at,
      dur: 0.09,
      color: 'white',
      freq: 2600,
      q: 0.9,
      env: [
        [0, 0],
        [0.008, 1],
        [0.09, 0, 'exp'],
      ],
      gain: 0.9 * accent,
      dest: track,
    });
    s.burst({
      at,
      dur: 0.07,
      color: 'pink',
      type: 'lowpass',
      freq: 500,
      q: 1,
      env: [
        [0, 0],
        [0.006, 1],
        [0.07, 0, 'exp'],
      ],
      gain: 1.1 * accent,
      dest: track,
    });
    at += (GAPS[i] ?? 0) * pace;
  }
  [
    [0.95, 0.24],
    [1.25, 0.5],
  ].forEach(([start, dur]) => {
    CHIME.forEach((note, index) => {
      const f = midiHz(note) * pitch;
      s.note({
        at: start,
        dur,
        freq: [
          [0, f * 0.94],
          [0.06, f],
          [dur, f * 0.98],
        ],
        wave: [1, 0.2, 0.08],
        env: [
          [0, 0],
          [0.04, 1],
          [dur - 0.08, 0.85],
          [dur, 0, 'exp'],
        ],
        gain: [0.15, 0.11, 0.09][index],
        pan: -0.2 + index * 0.2,
        dest: track,
      });
    });
    s.burst({
      at: start,
      dur,
      color: 'pink',
      freq: 1300,
      q: 1.5,
      env: [
        [0, 0],
        [0.03, 1],
        [dur - 0.08, 0.7],
        [dur, 0, 'exp'],
      ],
      gain: 0.12,
      dest: track,
    });
  });
  return s.done();
};

export default train;
