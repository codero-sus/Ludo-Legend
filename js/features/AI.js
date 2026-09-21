/* ═════════════════════════════════════════════════════════════
   features/AI.js — bot brain. Scores each legal move and picks the best.
   Priorities: finish > capture > leave base > reach safety >
   escape danger > advance furthest > avoid danger.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED } from "../config/constants.js";
import { globalIndexFor, isSafeGlobal } from "../board/BoardData.js";
import { targetForRoll, findCaptures, isThreatened } from "../core/Rules.js";

export function chooseToken(state, playerIdx, roll, movable) {
  const player = state.players[playerIdx];
  let best = movable[0];
  let bestScore = -Infinity;

  for (const tokenIdx of movable) {
    const token = player.tokens[tokenIdx];
    const target = targetForRoll(state, player, tokenIdx, roll);
    let score = Math.random() * 4; // small jitter so bots feel alive

    // 1. Finishing a token is the ultimate goal
    if (target === FINISHED) score += 120;

    // 2. Leaving base develops the army
    if (token.pos === YARD) score += 62;

    // 3. Captures swing games
    const captures = findCaptures(state, playerIdx, player.color, target);
    score += captures.length * 85;

    // 4. Landing safe / in home run
    if (target !== null && target >= 0 && target <= 50) {
      const g = globalIndexFor(player.color, target);
      if (isSafeGlobal(g)) score += 28;
      if (isThreatened(state, playerIdx, g)) score -= 34;
    }
    if (target !== null && target >= 51 && target <= 55) score += 22; // home column = untouchable

    // 5. Escape when currently in danger
    if (token.pos >= 0 && token.pos <= 50) {
      const g = globalIndexFor(player.color, token.pos);
      if (isThreatened(state, playerIdx, g)) score += 30;
      // 6. Otherwise prefer advancing the furthest token
      score += target * 0.45;
    }

    // 7. Prefer keeping a token that just reached the final home cell
    if (target === 55) score += 10;

    if (score > bestScore) {
      bestScore = score;
      best = tokenIdx;
    }
  }
  return best;
}
