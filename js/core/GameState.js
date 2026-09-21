/* ═════════════════════════════════════════════════════════════
   core/GameState.js — serialisable match state (no UI, no rules).
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, TOKENS_PER_PLAYER } from "../config/constants.js";

/**
 * @typedef {Object} PlayerState
 * @property {string} color  - 'red' | 'green' | 'yellow' | 'blue'
 * @property {string} name
 * @property {'human'|'bot'} type
 * @property {{pos:number}[]} tokens
 * @property {{captures:number, sixes:number, homes:number}} stats
 * @property {number|null} rank - finishing rank (null while racing)
 */

export class GameState {
  /**
   * @param {{ players: {color,name,type}[], rules: object }} config
   */
  constructor(config) {
    this.rules = { ...config.rules };
    /** @type {PlayerState[]} */
    this.players = config.players.map((p) => ({
      color: p.color,
      name: p.name,
      type: p.type,
      tokens: Array.from({ length: TOKENS_PER_PLAYER }, () => ({ pos: YARD })),
      stats: { captures: 0, sixes: 0, homes: 0 },
      rank: null
    }));
    this.turnIndex = 0;
    this.turnCount = 1;
    this.phase = "rolling"; // rolling | moving | animating | gameover
    this.lastRoll = null;
    this.consecutiveSixes = 0;
    this.movable = [];
    this.nextRank = 1;
  }

  currentPlayer() { return this.players[this.turnIndex]; }

  /** Players still racing (no rank yet). */
  racers() { return this.players.filter((p) => p.rank === null); }

  playerByColor(color) { return this.players.find((p) => p.color === color); }

  playerIndex(player) { return this.players.indexOf(player); }

  hasFinished(player) { return player.tokens.every((t) => t.pos === FINISHED); }

  finishedCount(player) { return player.tokens.filter((t) => t.pos === FINISHED).length; }

  /** 0..1 race progress across all tokens (for progress bars / standings). */
  progressOf(player) {
    const total = player.tokens.reduce((s, t) => s + Math.max(0, t.pos + 1), 0);
    return total / (TOKENS_PER_PLAYER * (FINISHED + 1));
  }

  isGameOver() { return this.racers().length <= 1; }

  // ── serialisation (save / resume) ──────────────────────────
  serialize() {
    return JSON.stringify({
      v: 1,
      rules: this.rules,
      players: this.players,
      turnIndex: this.turnIndex,
      turnCount: this.turnCount,
      lastRoll: this.lastRoll,
      consecutiveSixes: this.consecutiveSixes,
      nextRank: this.nextRank
    });
  }

  static deserialize(json) {
    const d = JSON.parse(json);
    const state = new GameState({ players: [], rules: d.rules });
    state.players = d.players;
    state.turnIndex = d.turnIndex;
    state.turnCount = d.turnCount;
    state.phase = "rolling";
    state.lastRoll = d.lastRoll;
    state.consecutiveSixes = d.consecutiveSixes;
    state.movable = [];
    state.nextRank = d.nextRank;
    return state;
  }
}
