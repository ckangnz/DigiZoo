import { Synth } from '../synth';
import type { Recipe } from '../types';

const bladder: Recipe = (voice) => {
  const s = new Synth(voice, 1.21);
  const pitch = s.vary(0.05);
  s.squelch({ freq: 900 * pitch, dur: 0.09, gain: 0.35 });
  s.spring({
    at: 0.02,
    dur: 0.5,
    freq: [
      [0, 360 * pitch],
      [0.05, 520 * pitch],
      [0.5, 560 * pitch],
    ],
    wave: 'sine',
    depth: 420,
    gain: 0.45,
  });
  s.chirp({
    at: 0.55,
    dur: 0.14,
    freq: [
      [0, 1350 * pitch],
      [0.14, 1900 * pitch],
    ],
    wave: [1, 0.25, 0.1],
    vibrato: { rate: 28, depth: 60 },
    gain: 0.14,
  });
  return s.done();
};

export default bladder;
