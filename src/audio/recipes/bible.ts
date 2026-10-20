import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const bible: Recipe = (voice) => {
  const s = new Synth(voice, 1.8).stereo();
  const pitch = s.vary(0.03);
  const flutter = s.tremolo({ rate: 28, depth: 0.5, dur: 0.24 });
  s.burst({
    dur: 0.22,
    color: 'white',
    freq: [
      [0, 1200],
      [0.12, 3500],
      [0.22, 2000],
    ],
    q: 1.2,
    env: [
      [0, 0],
      [0.03, 1],
      [0.12, 0.7],
      [0.22, 0, 'exp'],
    ],
    gain: 0.6,
    pan: [
      [0, -0.4],
      [0.22, 0.4],
    ],
    dest: flutter,
  });
  s.click({ at: 0.2, freq: 2800, q: 2, dur: 0.006, gain: 0.1 });
  const light = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.55 }));
  [
    [0.3, 79],
    [0.3, 86],
    [0.42, 91],
  ].forEach(([at, note], index) => {
    s.bell({
      at,
      freq: midiHz(note) * pitch,
      dur: 0.6,
      gain: index === 2 ? 0.08 : 0.13,
      dest: light,
    });
  });
  return s.done();
};

export default bible;
