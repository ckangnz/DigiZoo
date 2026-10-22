import { Synth, WOOD_PARTIALS } from '../synth';
import type { Recipe } from '../types';

const stagBeetle: Recipe = (voice) => {
  const s = new Synth(voice, 1.75).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const dur = 0.85;
  const flight = s.panner([
    [0, -0.6],
    [dur, 0.2],
  ]);
  const wings = s.tremolo({ rate: 50, depth: 0.6, dur: dur + 0.02, dest: flight });
  const drone = s.envelope(
    [
      [0, 0],
      [0.2, 1],
      [0.65, 0.9],
      [dur, 0, 'exp'],
    ],
    1,
    { dest: wings },
  );
  [-10, 10].forEach((cents) => {
    const spread = pitch * 2 ** (cents / 1200);
    s.note({
      dur,
      freq: [
        [0, 92 * spread],
        [0.4, 102 * spread],
        [dur, 90 * spread],
      ],
      wave: 'sawtooth',
      env: [
        [0, 1],
        [dur, 1],
      ],
      lowpass: 1100,
      gain: 0.25,
      dest: drone,
    });
  });
  s.burst({
    dur,
    color: 'pink',
    freq: 600,
    q: 0.9,
    env: [
      [0, 1],
      [dur, 1],
    ],
    gain: 0.15,
    dest: drone,
  });
  const land = 0.88 * pace;
  s.thump({ at: land, from: 220, to: 110, dur: 0.08, gain: 0.3, pan: 0.2 });
  s.click({ at: land, freq: 1600, q: 2, dur: 0.012, gain: 0.15, pan: 0.2 });
  [1.08, 1.22].forEach((offset, index) => {
    const at = offset * pace;
    s.mallet({
      at,
      freq: 1100 * pitch * (index === 0 ? 1 : 1.07),
      dur: 0.07,
      gain: 0.3,
      partials: WOOD_PARTIALS,
      hit: 0.5,
      pan: 0.2,
    });
    s.click({ at, freq: 2400, q: 3, dur: 0.01, gain: 0.15, pan: 0.2 });
  });
  return s.done();
};

export default stagBeetle;
