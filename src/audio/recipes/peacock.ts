import { Synth } from '../synth';
import type { Recipe } from '../types';

const peacock: Recipe = (voice) => {
  const s = new Synth(voice, 0.27);
  const pitch = s.vary(0.05);
  const bus = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.15 }));
  s.vocal({
    dur: 0.22,
    pitch: [
      [0, 520],
      [0.08, 610],
      [0.22, 570],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.04, 'e'],
      [0.22, 'i'],
    ],
    shift: 1.3,
    drive: 2,
    breath: 0.15,
    env: [
      [0, 0],
      [0.03, 1],
      [0.16, 0.8],
      [0.22, 0, 'exp'],
    ],
    gain: 0.4,
    dest: bus,
  });
  s.vocal({
    at: 0.27,
    dur: 0.6,
    pitch: [
      [0, 720],
      [0.06, 930],
      [0.38, 870],
      [0.6, 640],
    ],
    transpose: pitch,
    vowel: [
      [0, 'a'],
      [0.35, 'a'],
      [0.6, 'o'],
    ],
    wave: 'reed',
    shift: 1.3,
    drive: 3,
    growl: { rate: 70, depth: 0.25, fry: 30 },
    breath: 0.15,
    tone: 7000,
    vibrato: { rate: 6, depth: 20, delay: 0.15 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.4, 0.85],
      [0.6, 0, 'exp'],
    ],
    gain: 0.5,
    dest: bus,
  });
  return s.done();
};

export default peacock;
