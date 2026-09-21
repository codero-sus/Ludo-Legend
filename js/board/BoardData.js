/* ═════════════════════════════════════════════════════════════
   board/BoardData.js — static board geometry (15×15 grid).
   All coordinates below are [row, col] on a 0..14 grid unless noted.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, LAST_TRACK_POS } from "../config/constants.js";

export const GRID = 15;   // 15×15 board
export const CELL = 100;  // svg units per cell (viewBox 1500)

/**
 * The 52-cell main track in travel order (clockwise).
 * Index 0 = Red start … each colour starts 13 cells apart.
 */
export const MAIN_TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],           // 0-4
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],   // 5-10
  [0, 7],                                          // 11
  [0, 8],                                          // 12
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],           // 13-17
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], // 18-23
  [7, 14],                                         // 24
  [8, 14],                                         // 25
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],      // 26-30
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], // 31-36
  [14, 7],                                         // 37
  [14, 6],                                         // 38
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],      // 39-43
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],  // 44-49
  [7, 0],                                          // 50
  [6, 0]                                           // 51
];

/** Global track index where each colour enters the board. */
export const START_OFFSETS = { red: 0, green: 13, yellow: 26, blue: 39 };

/** Captures are impossible on these global cells (starts + star squares). */
export const SAFE_GLOBALS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

/** Star-only safe cells (non-start) — drawn with ★. */
export const STAR_GLOBALS = new Set([8, 21, 34, 47]);

/** Last main-track cell before each colour's home column (tinted + arrow). */
export const HOME_ENTRY_GLOBALS = { red: 51, green: 11, yellow: 25, blue: 38 };

/** The 5 home-column cells per colour, in travel order (pos 51..55). */
export const HOME_STRETCH = {
  red:    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green:  [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue:   [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};

/** Arrow rotation (deg) for the ➤ marker on each home column entry. */
export const HOME_ARROW_ANGLE = { red: 0, green: 90, yellow: 180, blue: 270 };

/**
 * Yard (base) token spots as {x, y} in cell units (col,row) —
 * matches the yard circles drawn by BoardRenderer.
 */
export const BASE_SPOTS = {
  red:    [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 4 }],
  green:  [{ x: 11, y: 2 }, { x: 13, y: 2 }, { x: 11, y: 4 }, { x: 13, y: 4 }],
  yellow: [{ x: 11, y: 11 }, { x: 13, y: 11 }, { x: 11, y: 13 }, { x: 13, y: 13 }],
  blue:   [{ x: 2, y: 11 }, { x: 4, y: 11 }, { x: 2, y: 13 }, { x: 4, y: 13 }]
};

/** Centre point of each colour's home triangle (cell units). */
export const FINISH_CENTER = {
  red: { x: 6.5, y: 7.5 },
  green: { x: 7.5, y: 6.5 },
  yellow: { x: 8.5, y: 7.5 },
  blue: { x: 7.5, y: 8.5 }
};

/** Global track index for a colour at relative progress `pos` (0..50). */
export function globalIndexFor(color, pos) {
  return (START_OFFSETS[color] + pos) % MAIN_TRACK.length;
}

/** Stable key identifying the physical cell of a token (for stacking). */
export function cellKeyFor(color, pos) {
  if (pos === YARD) return `B:${color}`;
  if (pos <= LAST_TRACK_POS) return `M:${globalIndexFor(color, pos)}`;
  if (pos < FINISHED) return `H:${color}:${pos}`;
  return `F:${color}`;
}

/**
 * Centre of a token's cell in cell units {x, y} (0..15).
 * @param tokenIdx needed for yard spots
 */
export function cellCenterFor(color, pos, tokenIdx = 0) {
  if (pos === YARD) return { ...BASE_SPOTS[color][tokenIdx] };
  if (pos <= LAST_TRACK_POS) {
    const [r, c] = MAIN_TRACK[globalIndexFor(color, pos)];
    return { x: c + 0.5, y: r + 0.5 };
  }
  if (pos < FINISHED) {
    const [r, c] = HOME_STRETCH[color][pos - 51];
    return { x: c + 0.5, y: r + 0.5 };
  }
  return { ...FINISH_CENTER[color] };
}

/** Is this global track cell safe from capture? */
export function isSafeGlobal(globalIdx) {
  return SAFE_GLOBALS.has(globalIdx);
}
