import { Synth } from '../synth';
import type { Recipe } from '../types';

const redBloodCell: Recipe = (voice) => {
  const s = new Synth(voice, 1.48).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.1;
  const flow: [number, number][] = [
    [0, -0.6],
    [dur, 0.6],
  ];
  const pulse = s.tremolo({ rate: 2.6, depth: 0.35, dur: dur + 0.02 });
  s.burst({
    dur,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300 * pitch],
      [0.4, 1400 * pitch],
      [dur, 500 * pitch],
    ],
    q: 4,
    swell: 0.4,
    gain: 0.5,
    pan: flow,
    dest: pulse,
  });
  const count = 8;
  for (let i = 0; i < count; i++) {
    const at = 0.1 + (i / count) * 0.85 + s.range(0, 0.05);
    s.bubble({
      at,
      freq: s.range(300, 800) * pitch,
      rise: 1.8,
      dur: 0.06,
      gain: s.range(0.32, 0.45),
      pan: -0.6 + (at / dur) * 1.2,
    });
  }
  return s.done();
};

export default redBloodCell;
