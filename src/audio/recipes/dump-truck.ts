import { Synth } from '../synth';
import type { Recipe } from '../types';

const dumpTruck: Recipe = (voice) => {
  const s = new Synth(voice, 0.971).stereo();
  const pitch = s.vary(0.04);
  const dur = 1.85;
  const engine = s.tremolo({
    rate: [
      [0, 14],
      [0.5, 20],
      [1.0, 15],
    ],
    depth: 0.6,
    dur: dur + 0.02,
  });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: [
      [0, 300],
      [0.5, 700],
      [1.0, 450],
    ],
    q: 1,
    env: [
      [0, 0],
      [0.2, 1],
      [dur - 0.3, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.6,
    dest: engine,
  });
  s.note({
    dur,
    freq: [
      [0, 40 * pitch],
      [0.5, 60 * pitch],
      [1.0, 45 * pitch],
    ],
    wave: 'buzz',
    env: [
      [0, 0],
      [0.2, 1],
      [dur - 0.3, 0.8],
      [dur, 0, 'exp'],
    ],
    lowpass: 500,
    gain: 0.25,
    dest: engine,
  });
  const tip = 0.85;
  const slide = 0.9;
  s.burst({
    at: tip,
    dur: slide,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 900],
      [0.3, 2500],
      [slide, 1200],
    ],
    q: 0.8,
    swell: 0.4,
    gain: 0.35,
  });
  const times = Array.from({ length: 24 }, () => tip + s.range(0.05, slide - 0.1));
  s.clicks({
    times,
    freq: times.map(() => s.range(900, 2600)),
    gain: times.map(() => s.range(0.1, 0.25)),
    q: 4,
    dur: 0.015,
    ring: 0.3,
  });
  [0.1, 0.35, 0.6].forEach((offset, index) => {
    s.thump({
      at: tip + offset,
      from: 200 * pitch,
      to: 80 * pitch,
      dur: 0.14,
      gain: 0.35 - index * 0.05,
      thud: 0.6,
    });
  });
  return s.done();
};

export default dumpTruck;
