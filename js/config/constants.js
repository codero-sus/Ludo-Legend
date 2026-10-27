/* ═════════════════════════════════════════════════════════════
   config/constants.js — single source of truth for game config
   + difficulty, themes, stats, hints
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
  needSixToLeave: true,
  exactFinish: true,
  bonusOnCapture: true,
  bonusOnHome: true,
  threeSixesForfeit: true
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

/** AI Difficulty */
export const DIFFICULTY = {
  easy:   { label: "Easy",   icon: "🌱", jitter: 28, captureBonus: 55,  threatAvoid: 12, desc: "Casual & forgiving" },
  medium: { label: "Medium", icon: "⚖️", jitter: 10, captureBonus: 85,  threatAvoid: 28, desc: "Balanced" },
  hard:   { label: "Hard",   icon: "🔥", jitter: 4,  captureBonus: 95,  threatAvoid: 38, desc: "Sharp tactics" },
  expert: { label: "Expert", icon: "👑", jitter: 0,  captureBonus: 110, threatAvoid: 45, desc: "Ruthless" }
};
export const DEFAULT_DIFFICULTY = "medium";

/** Themes */
export const THEMES = {
  festival: { label: "Festival", icon: "🪔", bg: "festival" },
  midnight: { label: "Midnight", icon: "🌙", bg: "midnight" },
  ocean:    { label: "Ocean",    icon: "🌊", bg: "ocean" },
  sunset:   { label: "Sunset",   icon: "🌅", bg: "sunset" }
};
export const DEFAULT_THEME = "festival";

/** Timing knobs (ms). */
export const DELAYS = {
  step: 200,
  botRoll: 950,
  botMove: 750,
  noMovePass: 1100,
  turnSwap: 500,
  capturePause: 550,
  winPause: 600
};

export const STORAGE_KEYS = {
  save: "ludo-legend-save-v1",
  sound: "ludo-legend-sound",
  config: "ludo-legend-config",
  theme: "ludo-legend-theme-v1",
  stats: "ludo-legend-stats-v1",
  diceHistory: "ludo-legend-dicehist-v1"
};
