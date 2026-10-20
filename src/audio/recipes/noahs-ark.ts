import { Synth } from '../synth';
import type { Recipe } from '../types';

const noahsArk: Recipe = (voice) => {
  const s = new Synth(voice, 2.07).stereo();
  const pitch = s.vary(0.05);
  const creak = 0.7;
  const amp = s.envelope(
    [
      [0, 0],
      [0.08, 0.7],
      [0.3, 1],
      [0.5, 0.6],
      [creak, 0, 'exp'],
    ],
    0.5,
  );
  const wood = s.gain(1);
  wood.connect(s.filter('bandpass', 680 * pitch, 6, { dest: amp }));
  wood.connect(s.filter('bandpass', 1450 * pitch, 5, { dest: s.gain(0.55, { dest: amp }) }));
  const saw = s.osc(
    'sawtooth',
    [
      [0, 30],
      [0.35, 70],
      [creak, 45],
    ],
    { dur: creak + 0.02, dest: wood },
  );
  s.wander(saw.detune, { depth: 140, rate: 2.5, dur: creak + 0.02 });
  [0.35, 0.85].forEach((at, index) => {
    s.burst({
      at,
      dur: 0.55,
      color: 'pink',
      type: 'lowpass',
      freq: [
        [0, 450],
        [0.25, 1200],
        [0.55, 500],
      ],
      q: 1.5,
      swell: 0.4,
      gain: 0.45,
      pan: index === 0 ? -0.35 : 0.35,
    });
  });
  s.bubble({ at: 1.05, freq: 380 * pitch, rise: 2, dur: 0.08, gain: 0.15 });
  return s.done();
};

export default noahsArk;
