/* ═════════════════════════════════════════════════════════════
   config/constants.js — single source of truth for game config
   ═════════════════════════════════════════════════════════════ */

/** Canonical clockwise turn order (also the colour order). */
export const COLORS = ["red", "green", "yellow", "blue"];

export const COLOR_META = {
  red:    { label: "Red",    avatar: "🦁", hex: "#ef233c" },
  green:  { label: "Green",  avatar: "🦚", hex: "#2dc653" },
  yellow: { label: "Yellow", avatar: "🐯", hex: "#ffb703" },
  blue:   { label: "Blue",   avatar: "🐘", hex: "#4361ee" },
};

/** Token progress scale: -1 = yard, 0..50 = main track, 51..55 = home column, 56 = finished. */
export const YARD = -1;
export const LAST_TRACK_POS = 50;
export const FIRST_HOME_POS = 51;
export const LAST_HOME_POS = 55;
export const FINISHED = 56;
export const HOME_STRETCH_LEN = 5;
export const TOKENS_PER_PLAYER = 4;
export const MAIN_TRACK_LEN = 52;

/** Default house rules (toggleable in setup). */
export const DEFAULT_RULES = {
  needSixToLeave: true,   // need a 6 to leave the base
  exactFinish: true,      // need exact roll to enter home
  bonusOnCapture: true,   // capture grants an extra roll
  bonusOnHome: true,      // bringing a token home grants an extra roll
  threeSixesForfeit: true // 3 consecutive sixes = turn skipped
};

export const RULE_DESCRIPTIONS = {
  needSixToLeave: "🎲 Need a 6 to leave base",
  exactFinish: "🎯 Exact roll to finish",
  bonusOnCapture: "⚔️ Capture = bonus roll",
  bonusOnHome: "🏠 Token home = bonus roll",
  threeSixesForfeit: "🚫 3 sixes skips turn"
};

/** Colour sets per player-count (balanced opposites for 2P). */
export const COLOR_SETS = {
  2: ["red", "yellow"],
  3: ["red", "green", "yellow"],
  4: ["red", "green", "yellow", "blue"]
};

export const HUMAN_NAMES = ["You", "Rohan", "Priya", "Arjun", "Diya", "Kabir"];
export const BOT_NAMES = ["Chintu Bot", "Bablu Bot", "Monty Bot", "Guddu Bot"];

/** Timing knobs (ms). */
export const DELAYS = {
  step: 200,          // per-cell hop while moving
  botRoll: 950,       // bot "thinking" before rolling
  botMove: 750,       // bot "thinking" before moving
  noMovePass: 1100,   // pause when no moves possible
  turnSwap: 500,      // pause between turns
  capturePause: 550,  // beat after a capture lands
  winPause: 600
};

export const STORAGE_KEYS = {
  save: "ludo-legend-save-v1",
  sound: "ludo-legend-sound",
  config: "ludo-legend-config"
};
