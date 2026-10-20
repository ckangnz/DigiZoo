import { describe, expect, it } from 'vitest';
import { capsule, circle, parsePath, pathBounds, scalePath, serialize, tube } from './paths';

describe('parsePath', () => {
  it('parses relative commands and compact arc flags', () => {
    const segs = parsePath('M10 10l5 5a2 2 0 01-4 0z');
    expect(segs.map((s) => s.c)).toEqual(['M', 'L', 'A', 'Z']);
    const arc = segs[2] as Extract<(typeof segs)[number], { c: 'A' }>;
    expect(arc.large).toBe(0);
    expect(arc.sweep).toBe(1);
    expect(arc.x).toBe(11);
    expect(arc.y).toBe(15);
  });

  it('expands shorthand curves', () => {
    const segs = parsePath('M0 0C10 0 20 10 20 20S30 40 40 40Q50 30 60 40T80 40');
    expect(segs.map((s) => s.c)).toEqual(['M', 'C', 'C', 'Q', 'Q']);
  });

  it('round-trips through serialize', () => {
    const d = 'M0 0L10 0L10 10Z';
    expect(serialize(parsePath(d))).toBe('M0 0L10 0L10 10Z');
  });

  it('rejects garbage', () => {
    expect(() => parsePath('M0 0 L x')).toThrow();
  });
});

describe('bounds', () => {
  it('measures a circle including the arc extremes', () => {
    const b = pathBounds(circle(50, 40, 10));
    expect(b.minX).toBeCloseTo(40, 0);
    expect(b.maxX).toBeCloseTo(60, 0);
    expect(b.minY).toBeCloseTo(30, 0);
    expect(b.maxY).toBeCloseTo(50, 0);
  });

  it('measures a tapered capsule', () => {
    const b = pathBounds(capsule(0, 0, 100, 0, 10, 5));
    expect(b.minX).toBeCloseTo(-10, 0);
    expect(b.maxX).toBeCloseTo(105, 0);
    expect(b.maxY).toBeCloseTo(10, 0);
  });
});

describe('transforms', () => {
  it('mirrors arcs by flipping sweep', () => {
    const mirrored = parsePath(scalePath('M0 0A5 5 0 0 1 10 0', -1, 1));
    const arc = mirrored[1] as Extract<(typeof mirrored)[number], { c: 'A' }>;
    expect(arc.sweep).toBe(0);
    expect(arc.x).toBe(-10);
  });

  it('builds a closed tube outline', () => {
    const d = tube(
      [
        [0, 0],
        [50, 10],
        [100, 0],
      ],
      8,
    );
    expect(d.endsWith('Z')).toBe(true);
    const b = pathBounds(d);
    expect(b.minY).toBeLessThan(0);
    expect(b.maxX).toBeGreaterThan(100);
  });
});
