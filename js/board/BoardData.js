/* ═════════════════════════════════════════════════════════════
   board/BoardData.js — static board geometry (15×15 grid).
   + memoization for hot paths (globalIndexFor, cellCenterFor) — efficiency.
   All coordinates below are [row, col] on a 0..14 grid unless noted.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, LAST_TRACK_POS } from "../config/constants.js";

export const GRID = 15;
export const CELL = 100;

export const MAIN_TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0]
];

export const START_OFFSETS = { red: 0, green: 13, yellow: 26, blue: 39 };
export const SAFE_GLOBALS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const STAR_GLOBALS = new Set([8, 21, 34, 47]);
export const HOME_ENTRY_GLOBALS = { red: 51, green: 11, yellow: 25, blue: 38 };
export const HOME_STRETCH = {
  red:    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green:  [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue:   [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};
export const HOME_ARROW_ANGLE = { red: 0, green: 90, yellow: 180, blue: 270 };
export const BASE_SPOTS = {
  red:    [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 4 }],
  green:  [{ x: 11, y: 2 }, { x: 13, y: 2 }, { x: 11, y: 4 }, { x: 13, y: 4 }],
  yellow: [{ x: 11, y: 11 }, { x: 13, y: 11 }, { x: 11, y: 13 }, { x: 13, y: 13 }],
  blue:   [{ x: 2, y: 11 }, { x: 4, y: 11 }, { x: 2, y: 13 }, { x: 4, y: 13 }]
};
export const FINISH_CENTER = {
  red: { x: 6.5, y: 7.5 },
  green: { x: 7.5, y: 6.5 },
  yellow: { x: 8.5, y: 7.5 },
  blue: { x: 7.5, y: 8.5 }
};

// ── Memoized hot paths ───────────────────────────────────────
const _globalCache = new Map();
const _centerCache = new Map();

export function globalIndexFor(color, pos) {
  const k = color+":"+pos;
  if (_globalCache.has(k)) return _globalCache.get(k);
  const v = (START_OFFSETS[color] + pos) % MAIN_TRACK.length;
  _globalCache.set(k, v);
  return v;
}

export function cellKeyFor(color, pos) {
  if (pos === YARD) return `B:${color}`;
  if (pos <= LAST_TRACK_POS) return `M:${globalIndexFor(color, pos)}`;
  if (pos < FINISHED) return `H:${color}:${pos}`;
  return `F:${color}`;
}

export function cellCenterFor(color, pos, tokenIdx = 0) {
  const k = `${color}:${pos}:${tokenIdx}`;
  if (_centerCache.has(k)) return _centerCache.get(k);
  let v;
  if (pos === YARD) v = { ...BASE_SPOTS[color][tokenIdx] };
  else if (pos <= LAST_TRACK_POS) {
    const [r, c] = MAIN_TRACK[globalIndexFor(color, pos)];
    v = { x: c + 0.5, y: r + 0.5 };
  } else if (pos < FINISHED) {
    const [r, c] = HOME_STRETCH[color][pos - 51];
    v = { x: c + 0.5, y: r + 0.5 };
  } else v = { ...FINISH_CENTER[color] };
  _centerCache.set(k, v);
  return v;
}

export function isSafeGlobal(globalIdx) {
  return SAFE_GLOBALS.has(globalIdx);
}

// Pre-warm caches idle
if (typeof window !== "undefined" && window.requestIdleCallback) {
  requestIdleCallback(() => {
    for (const c of Object.keys(START_OFFSETS)) for(let p=0;p<=56;p++) globalIndexFor(c,p);
  });
}
