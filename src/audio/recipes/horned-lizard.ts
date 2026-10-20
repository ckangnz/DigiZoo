import { Synth } from '../synth';
import type { Recipe } from '../types';

const hornedLizard: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  const steps = [0, 0.07, 0.14, 0.21].map((t) => t * pace);
  s.clicks({
    times: steps,
    freq: steps.map((_, i) => (i % 2 === 0 ? 3600 : 3100)),
    gain: 0.35,
    q: 3,
    dur: 0.006,
  });
  const puffAt = 0.36 * pace;
  const puff = 0.42;
  s.note({
    at: puffAt,
    dur: puff,
    freq: [
      [0, 190 * pitch],
      [puff, 620 * pitch],
    ],
    wave: [1, 0.3, 0.1],
    env: [
      [0, 0],
      [0.05, 0.6],
      [puff - 0.04, 1],
      [puff, 0, 'exp'],
    ],
    lowpass: 2200,
    gain: 0.3,
  });
  s.burst({
    at: puffAt,
    dur: puff,
    color: 'pink',
    freq: [
      [0, 500],
      [puff, 1800],
    ],
    q: 1.5,
    env: [
      [0, 0],
      [0.1, 0.6],
      [puff - 0.04, 1],
      [puff, 0, 'exp'],
    ],
    gain: 0.2,
  });
  s.click({ at: puffAt + puff, freq: 1200, q: 1, dur: 0.02, gain: 0.25 });
  s.burst({
    at: puffAt + puff + 0.12,
    dur: 0.3,
    color: 'white',
    type: 'highpass',
    freq: 3800,
    q: 3,
    env: [
      [0, 0],
      [0.04, 1],
      [0.3, 0, 'exp'],
    ],
    gain: 0.18,
  });
  return s.done();
};

export default hornedLizard;
