import { Synth, adsr, scaleContour } from '../synth';
import type { Recipe } from '../types';

const ufo: Recipe = (voice) => {
  const s = new Synth(voice, 0.87);
  const pitch = s.vary(0.04);
  const dur = 1.55;
  const space = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.5 }));
  const wow = s.tremolo({ rate: 3.5, depth: 0.35, dur: dur + 0.02, dest: space });
  s.note({
    dur,
    freq: scaleContour(
      [
        [0, 520],
        [0.3, 880],
        [0.55, 700],
        [0.85, 1050],
        [1.15, 780],
        [dur, 620],
      ],
      pitch,
    ),
    wave: [1, 0.12, 0.04],
    vibrato: { rate: 6.5, depth: 70 },
    env: [
      [0, 0],
      [0.12, 1],
      [1.2, 0.85],
      [dur, 0, 'exp'],
    ],
    gain: 0.3,
    dest: wow,
  });
  const hum = s.tremolo({ rate: 7, depth: 0.6, dur: dur + 0.02 });
  [110, 165].forEach((freq, index) => {
    s.note({
      dur,
      freq: freq * pitch,
      wave: 'triangle',
      env: adsr(dur, { attack: 0.2, release: 0.4 }),
      gain: index === 0 ? 0.12 : 0.05,
      dest: hum,
    });
  });
  return s.done();
};

export default ufo;
