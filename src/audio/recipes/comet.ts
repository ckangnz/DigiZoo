import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const TRAIL = [100, 98, 96, 93, 91, 88, 86, 84, 81, 79];

const comet: Recipe = (voice) => {
  const s = new Synth(voice, 2.6);
  const pitch = s.vary(0.03);
  const head = 1.0;
  const across: [number, number][] = [
    [0, -0.8],
    [head, 0.8],
  ];
  s.burst({
    dur: head,
    color: 'white',
    freq: [
      [0, 700],
      [0.45, 4200],
      [head, 1500],
    ],
    q: 1.1,
    swell: 0.4,
    gain: 0.35,
    pan: across,
  });
  s.burst({
    dur: head,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300],
      [0.45, 1200],
      [head, 500],
    ],
    q: 1,
    swell: 0.4,
    gain: 0.3,
    pan: across,
  });
  TRAIL.forEach((note, index) => {
    s.bell({
      at: 0.25 + index * 0.075 + s.jitter(0.01),
      freq: midiHz(note) * pitch,
      dur: 0.3,
      gain: 0.07,
      pan: -0.6 + index * 0.14,
    });
  });
  return s.done();
};

export default comet;
