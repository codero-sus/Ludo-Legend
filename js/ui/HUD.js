/* ═════════════════════════════════════════════════════════════
   ui/HUD.js — turn banner, player cards, hints, last-roll badge, log.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, COLOR_META } from "../config/constants.js";
import { el } from "../core/utils.js";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "4️⃣" };

export class HUD {
  /**
   * @param {object} els - { turnDot, turnText, cards, log, hint, lastRoll }
   */
  constructor(els) {
    this.e = els;
    this.maxLog = 80;
  }

  banner(text, color = null) {
    this.e.turnText.textContent = text;
    this.e.turnDot.className = "turn-dot" + (color ? ` ${color}` : "");
  }

  hint(text) { this.e.hint.textContent = text; }

  setLastRoll(value) {
    this.e.lastRoll.textContent = value ?? "–";
    this.e.lastRoll.classList.remove("pop");
    if (value) {
      void this.e.lastRoll.offsetWidth;
      this.e.lastRoll.classList.add("pop");
    }
  }

  // ── Player cards ───────────────────────────────────────────
  renderPlayers(state) {
    this.e.cards.innerHTML = "";
    for (const p of state.players) {
      const card = el("div", `player-card ${p.color}`);
      card.id = `card-${p.color}`;
      card.innerHTML = `
        <div class="player-avatar">${COLOR_META[p.color].avatar}</div>
        <div class="player-main">
          <div class="player-name">
            <span class="p-name"></span>
            <span class="type-badge ${p.type === "bot" ? "bot" : (p.name === "You" ? "you" : "")}">
              ${p.type === "bot" ? "BOT" : (p.name === "You" ? "YOU" : "HUMAN")}
            </span>
            <span class="rank-badge" hidden></span>
          </div>
          <div class="player-status">Waiting…</div>
          <div class="token-dots"></div>
        </div>
        <div class="player-stats"></div>
        <div class="progress-track"><div class="progress-fill"></div></div>`;
      card.querySelector(".p-name").textContent = p.name;
      const dots = card.querySelector(".token-dots");
      for (let i = 0; i < p.tokens.length; i++) dots.appendChild(el("span", "token-dot"));
      this.e.cards.appendChild(card);
    }
    this.update(state, {});
  }

  /**
   * Refresh cards for current state.
   * @param {object} opts - { status } status text override for active player
   */
  update(state, { status = null } = {}) {
    for (const p of state.players) {
      const card = document.getElementById(`card-${p.color}`);
      if (!card) continue;
      const isActive = state.players[state.turnIndex] === p && p.rank === null;

      card.classList.toggle("active", isActive);
      card.classList.toggle("ranked", p.rank !== null);

      const badge = card.querySelector(".rank-badge");
      if (p.rank !== null) {
        badge.hidden = false;
        badge.textContent = `${MEDALS[p.rank] ?? `#${p.rank}`} #${p.rank}`;
      } else {
        badge.hidden = true;
      }

      const statusEl = card.querySelector(".player-status");
      if (p.rank !== null) statusEl.textContent = `Finished #${p.rank} 🎉`;
      else if (isActive && status) statusEl.textContent = status;
      else if (!isActive) statusEl.textContent = p.type === "bot" ? "🤖 waiting…" : "Waiting…";

      const dots = card.querySelectorAll(".token-dot");
      p.tokens.forEach((t, i) => {
        dots[i].className = "token-dot" +
          (t.pos === FINISHED ? " home" : t.pos !== YARD ? " out" : "");
      });

      const finished = state.finishedCount(p);
      card.querySelector(".player-stats").innerHTML =
        `🏠 ${finished}/4<br>⚔️ ${p.stats.captures} · 6️⃣ ${p.stats.sixes}`;
      card.querySelector(".progress-fill").style.width =
        `${Math.round(state.progressOf(p) * 100)}%`;
    }
  }

  // ── Game log ───────────────────────────────────────────────
  log(message, color = "sys") {
    const li = el("li", color);
    li.textContent = message;
    this.e.log.prepend(li);
    while (this.e.log.children.length > this.maxLog) this.e.log.lastChild.remove();
  }

  clearLog() { this.e.log.innerHTML = ""; }

  /** Standings sorted by rank, then race progress. */
  standings(state) {
    return [...state.players].sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      return state.progressOf(b) - state.progressOf(a);
    });
  }
}
