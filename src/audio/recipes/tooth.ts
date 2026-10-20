import { GLASS_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const tooth: Recipe = (voice) => {
  const s = new Synth(voice, 1.1).stereo();
  const pitch = s.vary(0.03);
  s.bell({ freq: 2637 * pitch, dur: 0.9, gain: 0.3, partials: GLASS_PARTIALS });
  s.bell({ freq: 3951 * pitch, dur: 0.6, gain: 0.12 });
  s.burst({
    at: 0.05,
    dur: 0.35,
    color: 'white',
    type: 'highpass',
    freq: 6000,
    q: 0.7,
    swell: 0.3,
    gain: 0.05,
  });
  [4699, 5588, 6272, 5274, 7040].forEach((freq, index) => {
    s.bell({
      at: 0.12 + index * 0.08 + s.jitter(0.015),
      freq: freq * pitch,
      dur: 0.2,
      gain: 0.05,
      pan: s.range(-0.6, 0.6),
    });
  });
  return s.done();
};

export default tooth;
