import { GLASS_PARTIALS, Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const BLINKS: readonly (readonly [at: number, note: number])[] = [
  [0, 76],
  [0.26, 81],
  [0.52, 79],
  [0.8, 84],
  [1.05, 88],
];

const firefly: Recipe = (voice) => {
  const s = new Synth(voice, 2.34).stereo();
  const pitch = s.vary(0.02);
  const night = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.4 }));
  const hum = s.tremolo({ rate: 45, depth: 0.7, dur: 1.32, dest: night });
  s.burst({
    dur: 1.3,
    color: 'pink',
    freq: 900,
    q: 1,
    swell: 0.5,
    gain: 0.06,
    dest: hum,
  });
  BLINKS.forEach(([at, note], index) => {
    const pan = [-0.4, 0.3, -0.1, 0.4, 0][index];
    s.note({
      at,
      dur: 0.35,
      freq: midiHz(note) * pitch,
      wave: 'sine',
      env: [
        [0, 0],
        [0.05, 1],
        [0.12, 0.6],
        [0.35, 0, 'exp'],
      ],
      gain: 0.2,
      pan,
      dest: night,
    });
    s.bell({
      at: at + 0.02,
      freq: midiHz(note + 12) * pitch,
      dur: 0.3,
      gain: 0.03,
      partials: GLASS_PARTIALS,
      pan,
      dest: night,
    });
  });
  return s.done();
};

export default firefly;
