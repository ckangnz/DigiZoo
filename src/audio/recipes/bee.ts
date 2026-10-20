import { Synth } from '../synth';
import type { Recipe } from '../types';

const bee: Recipe = (voice) => {
  const s = new Synth(voice, 0.9).stereo();
  const pitch = s.vary(0.05);
  const dur = 1.3;
  const flight = s.panner([
    [0, -0.7],
    [dur, 0.7],
  ]);
  const amp = s.envelope(
    [
      [0, 0],
      [0.25, 0.8],
      [0.6, 1],
      [1.05, 0.7],
      [dur, 0, 'exp'],
    ],
    0.5,
    { dest: flight },
  );
  const wings = s.tremolo({ rate: 19, depth: 0.25, dur: dur + 0.02, dest: amp });
  const body = s.filter('lowpass', 2600, 0, { dest: wings });
  const nasal = s.filter('peaking', 900, 2, { dest: body, gain: 9 });
  const zz = s.gain(1, { dest: nasal });
  const path: [number, number][] = [
    [0, 205 * pitch],
    [0.6, 245 * pitch],
    [dur, 210 * pitch],
  ];
  [-9, 9].forEach((detune) => {
    const saw = s.osc('sawtooth', path, {
      dur: dur + 0.02,
      dest: s.gain(0.5, { dest: zz }),
      detune,
    });
    s.wander(saw.detune, { depth: 30, rate: 2, dur: dur + 0.02 });
  });
  return s.done();
};

export default bee;
