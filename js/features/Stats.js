/* ═════════════════════════════════════════════════════════════
   features/Stats.js — lifetime stats & streaks (localStorage, debounced)
   Tracks: games, wins per color, captures, sixes, fastest win,
   current streak, best streak. Used for HUD stats panel.
   ═════════════════════════════════════════════════════════════ */
import { STORAGE_KEYS } from "../config/constants.js";
import { debounce } from "../core/perf.js";

const DEFAULT_STATS = {
  games: 0,
  wins: { red:0, green:0, yellow:0, blue:0, human:0, bot:0 },
  captures: 0,
  sixes: 0,
  homes: 0,
  bestStreak: 0,
  currentStreak: 0,
  lastWinner: null,
  playTimeMs: 0,
  _sessionStart: null
};

export class Stats {
  constructor() {
    this.data = this.#load();
    this._saveDebounced = debounce(() => this.#save(), 400);
  }

  #load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.stats);
      if (!raw) return { ...DEFAULT_STATS, wins: {...DEFAULT_STATS.wins} };
      const d = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...d, wins: { ...DEFAULT_STATS.wins, ...(d.wins||{}) } };
    } catch { return { ...DEFAULT_STATS, wins: {...DEFAULT_STATS.wins} }; }
  }
  #save() {
    try { localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(this.data)); } catch {}
  }
  flush() { this.#save(); }

  startSession() { this.data._sessionStart = Date.now(); }
  endSession() {
    if (this.data._sessionStart) {
      this.data.playTimeMs += Date.now() - this.data._sessionStart;
      this.data._sessionStart = null;
      this._saveDebounced();
    }
  }

  recordGameStart() { this.data.games++; this._saveDebounced(); }
  recordCapture() { this.data.captures++; this._saveDebounced(); }
  recordSix() { this.data.sixes++; this._saveDebounced(); }
  recordHome() { this.data.homes++; this._saveDebounced(); }
  recordWin(player) {
    const c = player.color;
    this.data.wins[c] = (this.data.wins[c]||0)+1;
    if (player.type==="human") this.data.wins.human++;
    else this.data.wins.bot++;
    this.data.lastWinner = player.name;
    this.data.currentStreak = (this.data.currentStreak||0)+1;
    this.data.bestStreak = Math.max(this.data.bestStreak||0, this.data.currentStreak);
    this._saveDebounced();
  }
  recordLossResetStreak() { this.data.currentStreak = 0; this._saveDebounced(); }

  getSnapshot() {
    return { ...this.data, wins: {...this.data.wins} };
  }

  clear() {
    this.data = { ...DEFAULT_STATS, wins:{...DEFAULT_STATS.wins} };
    this.#save();
  }
}

export const stats = new Stats();
