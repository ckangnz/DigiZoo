import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const stegosaurus: Recipe = (voice) => {
  const s = new Synth(voice, 0.72);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  [0, 0.5].forEach((offset, index) => {
    const at = offset * pace;
    s.stomp({ at, freq: 75, dur: 0.4, gain: 0.65 });
    [0.2, 0.27].forEach((clack, k) => {
      s.mallet({
        at: at + clack,
        freq: (index === 0 ? 420 : 380) * pitch * (k === 0 ? 1 : 1.2),
        dur: 0.1,
        gain: 0.65,
        partials: WOOD_PARTIALS,
        hit: 0.5,
      });
    });
  });
  const dur = 0.8;
  s.vocal({
    at: 0.95 * pace,
    dur,
    pitch: [
      [0, 150],
      [0.15, 175],
      [0.6, 160],
      [dur, 125],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.1, 'a'],
      [0.55, 'a'],
      [dur, 'o'],
    ],
    wave: 'reed',
    shift: 0.85,
    growl: { rate: 14, depth: 0.3 },
    breath: 0.15,
    vibrato: { rate: 5, depth: 20, delay: 0.3 },
    env: [
      [0, 0],
      [0.08, 0.9],
      [0.2, 1],
      [0.6, 0.75],
      [dur, 0, 'exp'],
    ],
    tone: 2800,
    gain: 0.65,
  });
  return s.done();
};

export default stegosaurus;
