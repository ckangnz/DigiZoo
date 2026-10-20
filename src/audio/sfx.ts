import { Synth, pluck } from './synth';
import type { Recipe, SfxName } from './types';

const pop: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.06);
  s.note({
    dur: 0.12,
    freq: [
      [0, 360 * pitch],
      [0.045, 1150 * pitch, 'exp'],
      [0.12, 1300 * pitch, 'exp'],
    ],
    wave: 'soft',
    env: pluck(0.12, 1, 0.002),
    gain: 0.34,
  });
  s.click({ freq: 3200, q: 1.5, dur: 0.006, gain: 0.06 });
  return s.done();
};

const poof: Recipe = (voice) => {
  const s = new Synth(voice, 1.6);
  const pitch = s.vary(0.05);
  s.burst({
    dur: 0.32,
    color: 'pink',
    type: 'bandpass',
    freq: [
      [0, 1900 * pitch],
      [0.3, 420 * pitch, 'exp'],
    ],
    q: 0.8,
    env: [
      [0, 0],
      [0.012, 1],
      [0.32, 0, 'exp'],
    ],
    gain: 0.5,
  });
  s.thump({ from: 150 * pitch, to: 70 * pitch, dur: 0.2, gain: 0.14 });
  return s.done();
};

const boing: Recipe = (voice) => {
  const s = new Synth(voice, 1.1);
  const pitch = s.vary(0.05);
  const dur = 0.42;
  const amp = s.envelope(pluck(dur, 1, 0.004), 0.3);
  const spring = s.osc(
    'triangle',
    [
      [0, 210 * pitch],
      [0.06, 300 * pitch, 'exp'],
      [dur, 330 * pitch, 'exp'],
    ],
    { dur: dur + 0.02, dest: amp },
  );
  s.lfo(spring.detune, {
    rate: [
      [0, 15],
      [dur, 11],
    ],
    depth: [
      [0, 380],
      [dur, 30, 'exp'],
    ],
    dur: dur + 0.02,
  });
  return s.done();
};

const whoosh: Recipe = (voice) => {
  const s = new Synth(voice, 3.1);
  const pitch = s.vary(0.06);
  s.burst({
    dur: 0.32,
    color: 'white',
    type: 'bandpass',
    freq: [
      [0, 450 * pitch],
      [0.16, 2600 * pitch, 'exp'],
      [0.32, 800 * pitch, 'exp'],
    ],
    q: 1.3,
    swell: 0.4,
    gain: 0.42,
    pan: [
      [0, -0.6],
      [0.32, 0.6],
    ],
  });
  return s.done();
};

const click: Recipe = (voice) => {
  const s = new Synth(voice, 0.9);
  const pitch = s.vary(0.04);
  s.click({ freq: 2300 * pitch, q: 2.5, dur: 0.012, gain: 0.22 });
  s.note({ dur: 0.04, freq: 1450 * pitch, wave: 'soft', env: pluck(0.04, 1, 0.001), gain: 0.12 });
  return s.done();
};

const sparkle: Recipe = (voice) => {
  const s = new Synth(voice, 1.9);
  const pitch = s.vary(0.03);
  const notes = [1319, 1568, 1760, 2093, 2637];
  notes.forEach((freq, index) => {
    s.bell({
      at: index * 0.055 + s.jitter(0.006) + 0.006,
      freq: freq * pitch,
      dur: 0.3,
      gain: 0.12 - index * 0.012,
      pan: -0.5 + index * 0.25,
    });
  });
  return s.done();
};

const tick: Recipe = (voice) => {
  const s = new Synth(voice, 0.9);
  const pitch = s.vary(0.03);
  s.click({ freq: 1900 * pitch, q: 7, dur: 0.02, gain: 0.2 });
  s.note({ dur: 0.03, freq: 1250 * pitch, wave: 'sine', env: pluck(0.03, 1, 0.001), gain: 0.08 });
  return s.done();
};

const chime: Recipe = (voice) => {
  const s = new Synth(voice, 1.7);
  const pitch = s.vary(0.02);
  [1047, 1319, 1568].forEach((freq, index) => {
    s.bell({
      at: index * 0.07,
      freq: freq * pitch,
      dur: 0.42,
      gain: 0.14,
      pan: -0.25 + index * 0.25,
    });
  });
  return s.done();
};

const swoosh: Recipe = (voice) => {
  const s = new Synth(voice, 1.45);
  const pitch = s.vary(0.05);
  s.burst({
    dur: 0.36,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300 * pitch],
      [0.2, 2300 * pitch, 'exp'],
      [0.36, 900 * pitch, 'exp'],
    ],
    q: 3,
    swell: 0.45,
    gain: 0.4,
    pan: [
      [0, -0.35],
      [0.36, 0.25],
    ],
  });
  return s.done();
};

function steps(freqs: readonly number[]): Recipe {
  return (voice) => {
    const s = new Synth(voice, 1.4);
    const pitch = s.vary(0.02);
    freqs.forEach((freq, index) => {
      s.note({
        at: index * 0.085,
        dur: 0.11,
        freq: freq * pitch,
        wave: 'soft',
        env: pluck(0.11, 1, 0.004),
        gain: 0.22,
      });
    });
    return s.done();
  };
}

export const SFX: Record<SfxName, Recipe> = {
  pop,
  poof,
  boing,
  whoosh,
  click,
  sparkle,
  tick,
  chime,
  swoosh,
  stepUp: steps([660, 880]),
  stepDown: steps([880, 660]),
};
