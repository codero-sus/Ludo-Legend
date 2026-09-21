/* ═════════════════════════════════════════════════════════════
   core/Rules.js — pure rule functions (no DOM, no state mutation,
   except where explicitly documented). Easily unit-testable.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED } from "../config/constants.js";
import { globalIndexFor, isSafeGlobal } from "../board/BoardData.js";

/**
 * Target progress for a token given a roll, or null if it cannot move.
 * Returns FINISHED for overshoot moves when exactFinish is off.
 */
export function targetForRoll(state, player, tokenIdx, roll) {
  const token = player.tokens[tokenIdx];
  if (player.rank !== null || token.pos === FINISHED) return null;

  if (token.pos === YARD) {
    if (state.rules.needSixToLeave && roll !== 6) return null;
    return 0;
  }
  const target = token.pos + roll;
  if (target === FINISHED) return FINISHED;
  if (target < FINISHED) return target;
  // Overshoot:
  return state.rules.exactFinish ? null : FINISHED;
}

/** Indices of tokens that can legally move. */
export function getMovableTokens(state, playerIdx, roll) {
  const player = state.players[playerIdx];
  if (!player || player.rank !== null) return [];
  const out = [];
  for (let i = 0; i < player.tokens.length; i++) {
    if (targetForRoll(state, player, i, roll) !== null) out.push(i);
  }
  return out;
}

/**
 * Opponent tokens that WOULD be captured by moving to `targetPos`.
 * @returns {{playerIdx:number, tokenIdx:number}[]}
 */
export function findCaptures(state, moverIdx, moverColor, targetPos) {
  if (targetPos === YARD || targetPos === FINISHED || targetPos > 50) return [];
  const global = globalIndexFor(moverColor, targetPos);
  if (isSafeGlobal(global)) return [];

  const victims = [];
  state.players.forEach((p, pi) => {
    if (pi === moverIdx || p.rank !== null) return;
    p.tokens.forEach((t, ti) => {
      if (t.pos >= 0 && t.pos <= 50 && globalIndexFor(p.color, t.pos) === global) {
        victims.push({ playerIdx: pi, tokenIdx: ti });
      }
    });
  });
  return victims;
}

/**
 * Is `global` threatened — i.e. could an enemy land on it next turn?
 * Used by the AI to evaluate danger (approximation: any enemy within
 * 1..6 steps behind on the main track).
 */
export function isThreatened(state, moverIdx, global) {
  if (isSafeGlobal(global)) return false;
  return state.players.some((p, pi) => {
    if (pi === moverIdx || p.rank !== null) return false;
    return p.tokens.some((t) => {
      if (t.pos < 0 || t.pos > 50) return false;
      const enemyGlobal = globalIndexFor(p.color, t.pos);
      const dist = (global - enemyGlobal + 52) % 52;
      return dist >= 1 && dist <= 6;
    });
  });
}
