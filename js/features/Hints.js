/* ═════════════════════════════════════════════════════════════
   features/Hints.js — explains best move for humans.
   Wraps AI scoring to produce a reason string + tokenIdx.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED } from "../config/constants.js";
import { globalIndexFor, isSafeGlobal } from "../board/BoardData.js";
import { targetForRoll, findCaptures, isThreatened } from "../core/Rules.js";

export function hintFor(state, playerIdx, roll, movable) {
  if (!movable.length) return null;
  const player = state.players[playerIdx];
  let best = movable[0], bestScore = -Infinity, bestReason = "";
  for (const tokenIdx of movable) {
    const token = player.tokens[tokenIdx];
    const target = targetForRoll(state, player, tokenIdx, roll);
    let score = 0, reason = "";
    if (target === FINISHED) { score += 120; reason = "Finish a token! 🏠"; }
    else if (token.pos === YARD) { score += 62; reason = "Get out of base 🚀"; }
    else {
      const caps = findCaptures(state, playerIdx, player.color, target);
      if (caps.length) { score += caps.length*85; reason = `Capture ${caps.length} token${caps.length>1?"s":""}! ⚔️`; }
      else if (target!==null && target>=0 && target<=50) {
        const g = globalIndexFor(player.color, target);
        if (isSafeGlobal(g)) { score += 28; reason = "Land on safe star ⭐"; }
        else if (isThreatened(state, playerIdx, g)) { score -= 34; reason = "Risky — can be captured"; }
        else reason = "Advance forward ➜";
      }
      if (target!==null && target>=51 && target<=55) { score += 22; reason = "Enter home column — safe!"; }
      if (token.pos>=0 && token.pos<=50 && isThreatened(state, playerIdx, globalIndexFor(player.color, token.pos))) {
        score += 30; reason = "Escape danger! 🏃";
      }
      score += (target||0)*0.45;
    }
    if (score > bestScore) { bestScore = score; best = tokenIdx; bestReason = reason; }
  }
  return { tokenIdx: best, reason: bestReason || "Best progress" };
}
