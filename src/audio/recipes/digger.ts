import { Synth } from '../synth';
import type { Recipe } from '../types';

const digger: Recipe = (voice) => {
  const s = new Synth(voice, 1.03).stereo();
  const pitch = s.vary(0.04);
  const dur = 1.85;
  const engine = s.tremolo({ rate: 24, depth: 0.6, dur: dur + 0.02 });
  const level: [number, number][] = [
    [0, 0],
    [0.15, 1],
    [dur - 0.25, 0.85],
    [dur, 0],
  ];
  s.burst({
    dur,
    color: 'pink',
    type: 'lowpass',
    freq: 520,
    q: 0.7,
    env: level,
    gain: 0.35,
    dest: engine,
  });
  s.note({
    dur,
    freq: 48 * pitch,
    wave: 'buzz',
    env: level,
    lowpass: 600,
    gain: 0.25,
    dest: engine,
  });
  const lift = 0.25;
  const whine = 1.25;
  const hydraulic = s.envelope(
    [
      [0, 0],
      [0.2, 1],
      [whine - 0.25, 0.9],
      [whine, 0, 'exp'],
    ],
    1,
    { at: lift },
  );
  const path: [number, number][] = [
    [0, 300 * pitch],
    [0.7, 520 * pitch],
    [1.0, 540 * pitch],
    [whine, 380 * pitch],
  ];
  s.note({
    at: lift,
    dur: whine,
    freq: path,
    wave: 'sawtooth',
    env: [
      [0, 1],
      [whine, 1],
    ],
    vibrato: { rate: 7, depth: 8 },
    lowpass: 1400,
    gain: 0.12,
    dest: hydraulic,
  });
  s.burst({
    at: lift,
    dur: whine,
    color: 'pink',
    freq: 2500,
    q: 1.2,
    env: [
      [0, 1],
      [whine, 1],
    ],
    gain: 0.05,
    dest: hydraulic,
  });
  const scoop = 1.5;
  s.stomp({ at: scoop, freq: 70, dur: 0.3, gain: 0.55 });
  s.burst({
    at: scoop + 0.02,
    dur: 0.3,
    color: 'white',
    freq: 2000,
    q: 0.7,
    env: [
      [0, 0],
      [0.01, 1],
      [0.08, 0.4],
      [0.3, 0, 'exp'],
    ],
    gain: 0.3,
  });
  return s.done();
};

export default digger;
