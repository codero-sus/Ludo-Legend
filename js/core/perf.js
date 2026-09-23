/* ═════════════════════════════════════════════════════════════
   core/perf.js — tiny performance helpers (no deps).
   RAF batching, debounce/throttle, memoize, object pool.
   Used to keep 60fps even with tons of effects.
   ═════════════════════════════════════════════════════════════ */

// — RAF batch: coalesce many DOM writes into next frame —
const rafQueue = new Set();
let rafScheduled = false;
export function rafBatch(fn) {
  rafQueue.add(fn);
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      const q = [...rafQueue];
      rafQueue.clear();
      for (const f of q) try { f(); } catch {}
    });
  }
}

// — Debounce: wait until quiet —
export function debounce(fn, ms = 120) {
  let t = 0;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// — Throttle: at most once per ms (rAF aligned if ms=16) —
export function throttle(fn, ms = 100) {
  let last = 0, timer = 0, lastArgs = null;
  return (...args) => {
    const now = performance.now();
    const remaining = ms - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timer);
      last = now;
      fn(...lastArgs);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = performance.now();
        timer = 0;
        fn(...lastArgs);
      }, remaining);
    }
  };
}

// — Memoize single-arg pure fn (for geometry) —
export function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (cache.has(key)) return cache.get(key);
    const v = fn(key);
    cache.set(key, v);
    return v;
  };
}

// — Simple object pool (for particles, trail dots) —
export class Pool {
  constructor(factory, size = 64) {
    this.factory = factory;
    this.free = Array.from({ length: size }, () => factory());
    this.active = new Set();
  }
  acquire() {
    const o = this.free.pop() || this.factory();
    this.active.add(o);
    return o;
  }
  release(o) { this.active.delete(o); this.free.push(o); }
  releaseAll() { for (const o of [...this.active]) this.release(o); }
}

// — Idle helper: use requestIdleCallback if available —
export const onIdle = (cb, timeout = 1200) =>
  (window.requestIdleCallback
    ? requestIdleCallback(cb, { timeout })
    : setTimeout(cb, 64));

// — Reduced motion check (respects OS setting) —
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// — Measure helper for dev —
export const now = () => performance.now();
