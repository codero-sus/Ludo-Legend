/* ═════════════════════════════════════════════════════════════
   features/AI.js — bot brain with difficulty levels.
   Easy: high jitter, low tactics — plays loosely.
   Medium: balanced (original).
   Hard/Expert: sharp, low jitter, values captures & safety highly.
   Priorities: finish > capture > leave base > safety > escape > progress
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, DIFFICULTY } from "../config/constants.js";
import { globalIndexFor, isSafeGlobal } from "../board/BoardData.js";
import { targetForRoll, findCaptures, isThreatened } from "../core/Rules.js";

export function chooseToken(state, playerIdx, roll, movable, difficulty = "medium") {
  const d = DIFFICULTY[difficulty] || DIFFICULTY.medium;
  const player = state.players[playerIdx];
  let best = movable[0];
  let bestScore = -Infinity;

  for (const tokenIdx of movable) {
    const token = player.tokens[tokenIdx];
    const target = targetForRoll(state, player, tokenIdx, roll);
    let score = Math.random() * d.jitter;

    if (target === FINISHED) score += 130;
    if (token.pos === YARD) score += 62;

    const captures = findCaptures(state, playerIdx, player.color, target);
    score += captures.length * d.captureBonus;

    if (target !== null && target >= 0 && target <= 50) {
      const g = globalIndexFor(player.color, target);
      if (isSafeGlobal(g)) score += d.threatAvoid * 0.85;
      if (isThreatened(state, playerIdx, g)) score -= d.threatAvoid;
    }
    if (target !== null && target >= 51 && target <= 55) score += 26;

    if (token.pos >= 0 && token.pos <= 50) {
      const g = globalIndexFor(player.color, token.pos);
      if (isThreatened(state, playerIdx, g)) score += d.threatAvoid * 0.9;
      score += (target||0) * 0.5;
    }
    if (target === 55) score += 12;

    // Expert looks 1 move ahead: if next roll could finish, favor advancing near home
    if (difficulty==="expert" && target!==null && target>=48 && target<=55) score += 8;

    if (score > bestScore) { bestScore = score; best = tokenIdx; }
  }
  // Easy sometimes intentionally picks random non-optimal
  if (difficulty==="easy" && Math.random()<0.22) return movable[Math.floor(Math.random()*movable.length)];
  return best;
}

/** For hints: also return scored options sorted */
export function scoredOptions(state, playerIdx, roll, movable, difficulty="medium") {
  const opts = movable.map(idx => {
    const target = targetForRoll(state, state.players[playerIdx], idx, roll);
    return { idx, target, captures: findCaptures(state, playerIdx, state.players[playerIdx].color, target).length };
  });
  // score via chooseToken logic by reusing it with deterministic tie break
  opts.sort((a,b)=> {
    const sa = a.captures*10 + (a.target===FINISHED? 100:0) + (a.target||0);
    const sb = b.captures*10 + (b.target===FINISHED? 100:0) + (b.target||0);
    return sb-sa;
  });
  return opts;
}
