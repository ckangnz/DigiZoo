import { Synth, type Point } from '../synth';
import type { Recipe } from '../types';

const helicopter: Recipe = (voice) => {
  const s = new Synth(voice, 1.69).stereo();
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const count = 18;
  const gap = 0.092 * pace;
  const dur = gap * (count - 1) + 0.08;
  const pass: Point[] = [
    [0, -0.6],
    [dur, 0.6],
  ];
  const wash = s.tremolo({ rate: 1 / gap, depth: 0.85, dur: dur + 0.02, dest: s.panner(pass) });
  s.burst({ dur, color: 'pink', freq: 700, q: 0.7, swell: 0.5, gain: 0.9, dest: wash });
  const times = Array.from({ length: count }, (_, i) => i * gap);
  const levels = times.map((_, i) => 0.35 + 0.65 * Math.sin((Math.PI * (i + 0.5)) / count));
  s.clicks({
    times,
    freq: 550 * pitch,
    gain: levels.map((level) => 0.2 * level),
    q: 0.8,
    dur: 0.065,
    color: 'pink',
    pan: pass,
  });
  times.forEach((at, i) => {
    s.thump({
      at,
      from: 120 * pitch,
      to: 65 * pitch,
      dur: 0.07,
      gain: 0.15 * levels[i],
      pan: pass,
    });
  });
  s.note({
    dur,
    freq: [
      [0, 1550 * pitch],
      [dur, 1650 * pitch],
    ],
    wave: 'sine',
    env: [
      [0, 0],
      [dur * 0.5, 1],
      [dur, 0, 'exp'],
    ],
    gain: 0.025,
    pan: pass,
  });
  s.burst({
    dur,
    color: 'pink',
    freq: 3000,
    q: 0.9,
    swell: 0.5,
    gain: 0.06,
    pan: pass,
  });
  return s.done();
};

export default helicopter;
