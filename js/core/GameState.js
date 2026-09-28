/* ═════════════════════════════════════════════════════════════
   core/GameState.js — serialisable match state (no UI, no rules).
   + difficulty, diceHistory, undo snapshot support
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, TOKENS_PER_PLAYER } from "../config/constants.js";

/**
 * @typedef {Object} PlayerState
 * @property {string} color
 * @property {string} name
 * @property {'human'|'bot'} type
 * @property {string} difficulty
 * @property {{pos:number}[]} tokens
 * @property {{captures:number, sixes:number, homes:number}} stats
 * @property {number|null} rank
 */

export class GameState {
  /**
   * @param {{ players: {color,name,type,difficulty}[], rules: object }} config
   */
  constructor(config) {
    this.rules = { ...config.rules };
    /** @type {PlayerState[]} */
    this.players = config.players.map((p) => ({
      color: p.color,
      name: p.name,
      type: p.type,
      difficulty: p.difficulty || "medium",
      tokens: Array.from({ length: TOKENS_PER_PLAYER }, () => ({ pos: YARD })),
      stats: { captures: 0, sixes: 0, homes: 0 },
      rank: null
    }));
    this.turnIndex = 0;
    this.turnCount = 1;
    this.phase = "rolling";
    this.lastRoll = null;
    this.consecutiveSixes = 0;
    this.movable = [];
    this.nextRank = 1;
    this.diceHistory = []; // {roll, color, turn}
    this.startedAt = Date.now();
  }

  currentPlayer() { return this.players[this.turnIndex]; }
  racers() { return this.players.filter((p) => p.rank === null); }
  playerByColor(color) { return this.players.find((p) => p.color === color); }
  playerIndex(player) { return this.players.indexOf(player); }
  hasFinished(player) { return player.tokens.every((t) => t.pos === FINISHED); }
  finishedCount(player) { return player.tokens.filter((t) => t.pos === FINISHED).length; }
  progressOf(player) {
    const total = player.tokens.reduce((s, t) => s + Math.max(0, t.pos + 1), 0);
    return total / (TOKENS_PER_PLAYER * (FINISHED + 1));
  }
  isGameOver() { return this.racers().length <= 1; }

  pushDiceHistory(roll, color) {
    this.diceHistory.push({ roll, color, turn: this.turnCount });
    if (this.diceHistory.length > 12) this.diceHistory.shift();
  }

  // ── serialisation ──────────────────────────────────────────
  serialize() {
    return JSON.stringify({
      v: 2,
      rules: this.rules,
      players: this.players,
      turnIndex: this.turnIndex,
      turnCount: this.turnCount,
      lastRoll: this.lastRoll,
      consecutiveSixes: this.consecutiveSixes,
      nextRank: this.nextRank,
      diceHistory: this.diceHistory,
      startedAt: this.startedAt
    });
  }

  static deserialize(json) {
    const d = JSON.parse(json);
    const state = new GameState({ players: [], rules: d.rules });
    state.players = d.players.map(p => ({ difficulty:"medium", ...p }));
    state.turnIndex = d.turnIndex;
    state.turnCount = d.turnCount;
    state.phase = "rolling";
    state.lastRoll = d.lastRoll;
    state.consecutiveSixes = d.consecutiveSixes;
    state.movable = [];
    state.nextRank = d.nextRank;
    state.diceHistory = d.diceHistory || [];
    state.startedAt = d.startedAt || Date.now();
    return state;
  }

  clone() { return GameState.deserialize(this.serialize()); }
}
