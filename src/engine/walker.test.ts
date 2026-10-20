import { describe, expect, it } from 'vitest';
import { patrolBounds } from './walker';

describe('patrolBounds', () => {
  it('patrols a few steps either side of where the walk started', () => {
    expect(patrolBounds(1800, 300, 100, 3600, null)).toEqual([1500, 2100]);
  });

  it('turns before the animal leaves the visible screen', () => {
    const [lo, hi] = patrolBounds(1800, 300, 100, 3600, [1600, 2050]);
    expect(lo).toBe(1700);
    expect(hi).toBe(1950);
  });

  it('stays inside the world', () => {
    const [lo, hi] = patrolBounds(150, 300, 100, 3600, null);
    expect(lo).toBe(130);
    expect(hi).toBe(450);
  });

  it('walks in place when there is no room', () => {
    const [lo, hi] = patrolBounds(1800, 300, 400, 3600, [1600, 2000]);
    expect(lo).toBe(hi);
  });
});
