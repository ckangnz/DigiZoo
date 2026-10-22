import { Synth } from '../synth';
import type { Recipe } from '../types';

const moose: Recipe = (voice) => {
  const s = new Synth(voice, 0.395).stereo();
  const pitch = s.vary(0.05);
  const lake = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.28, bright: 0.35 }));
  const dur = 1.2 * s.vary(0.03);
  s.vocal({
    dur,
    pitch: [
      [0, 180],
      [0.13 * dur, 260],
      [0.5 * dur, 250],
      [0.83 * dur, 200],
      [dur, 150],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.08 * dur, 'o'],
      [0.25 * dur, 'a'],
      [0.75 * dur, 'o'],
      [dur, 'u'],
    ],
    wave: 'buzz',
    shift: 0.95,
    vibrato: { rate: 5, depth: 25, delay: 0.4 },
    growl: { rate: 16, depth: 0.25 },
    drive: 1.8,
    breath: 0.25,
    body: 0.05,
    env: [
      [0, 0],
      [0.08 * dur, 0.7],
      [0.25 * dur, 1],
      [0.7 * dur, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 3500,
    gain: 0.5,
    dest: lake,
  });
  return s.done();
};

export default moose;
