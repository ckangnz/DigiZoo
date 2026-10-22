import { Synth } from '../synth';
import type { Recipe } from '../types';

const caveFish: Recipe = (voice) => {
  const s = new Synth(voice, 1.31).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.3 }));
  const ripple = s.bus(
    cave,
    s.echo({ time: 0.12, feedback: 0.2, wet: 0.3, tone: 2000, dest: cave }),
  );
  s.burst({
    dur: 0.25,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300],
      [0.12, 1200],
      [0.25, 400],
    ],
    q: 1.5,
    swell: 0.4,
    gain: 0.3,
    pan: [
      [0, -0.3],
      [0.25, 0.3],
    ],
    dest: cave,
  });
  [0.32, 0.6].forEach((offset, index) => {
    const at = offset * pace;
    const lift = pitch * (index === 0 ? 1 : 1.15);
    s.bubble({ at, freq: 260 * lift, rise: 2.2, dur: 0.1, gain: 0.4, dest: ripple });
    s.thump({ at, from: 160 * lift, to: 100 * lift, dur: 0.05, gain: 0.12, dest: ripple });
  });
  s.bubble({
    at: 0.92 * pace,
    freq: 1500 * pitch,
    rise: 1.8,
    dur: 0.035,
    gain: 0.2,
    pan: -0.3,
    dest: cave,
  });
  return s.done();
};

export default caveFish;
