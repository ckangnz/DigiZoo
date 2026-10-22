import { Synth, type Point } from '../synth';
import type { Recipe } from '../types';

const ambulance: Recipe = (voice) => {
  const s = new Synth(voice, 1.21).stereo();
  const pitch = s.vary(0.02);
  const step = 0.4;
  const tones = [880, 660, 880, 660].map((f) => f * pitch);
  const dur = step * tones.length;
  const freq: Point[] = tones.flatMap((f, i): Point[] => [
    [i * step + (i === 0 ? 0 : 0.02), f],
    [(i + 1) * step, f],
  ]);
  const street = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.18, bright: 0.4 }));
  const pulse = s.tremolo({ rate: 6, depth: 0.25, dur: dur + 0.02, dest: street });
  s.note({
    dur,
    freq,
    wave: [1, 0.3, 0.12, 0.05],
    env: [
      [0, 0],
      ...tones.flatMap((_, i): Point[] => [
        [i * step + 0.03, 1],
        [i * step + 0.14, 0.62],
        [(i + 1) * step - 0.01, 0.5],
      ]),
      [dur, 0, 'exp'],
    ],
    gain: 0.3,
    dest: pulse,
  });
  return s.done();
};

export default ambulance;
