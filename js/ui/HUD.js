/* ═════════════════════════════════════════════════════════════
   ui/HUD.js — turn banner, player cards, hints, last-roll badge, log.
   Optimized: RAF-batched updates, diffed DOM, micro-animations.
   ═════════════════════════════════════════════════════════════ */
import { YARD, FINISHED, COLOR_META } from "../config/constants.js";
import { el } from "../core/utils.js";
import { rafBatch } from "../core/perf.js";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "4️⃣" };

export class HUD {
  /**
   * @param {object} els - { turnDot, turnText, cards, log, hint, lastRoll }
   */
  constructor(els) {
    this.e = els;
    this.maxLog = 80;
    this._lastBanner = "";
  }

  banner(text, color = null) {
    if (text === this._lastBanner && this.e.turnDot.classList.contains(color||"")) return;
    this._lastBanner = text;
    // slide animation
    this.e.turnText.style.opacity = "0";
    this.e.turnText.style.transform = "translateY(4px)";
    rafBatch(() => {
      this.e.turnText.textContent = text;
      this.e.turnDot.className = "turn-dot" + (color ? ` ${color}` : "");
      requestAnimationFrame(() => {
        this.e.turnText.style.transition = "opacity 220ms var(--ease-out), transform 220ms var(--ease-out)";
        this.e.turnText.style.opacity = "1";
        this.e.turnText.style.transform = "none";
        setTimeout(()=> this.e.turnText.style.transition="", 260);
      });
    });
  }

  hint(text) {
    this.e.hint.style.opacity = "0";
    rafBatch(() => {
      this.e.hint.textContent = text;
      requestAnimationFrame(() => {
        this.e.hint.style.transition = "opacity 180ms var(--ease-out)";
        this.e.hint.style.opacity = "1";
        setTimeout(()=> this.e.hint.style.transition="", 220);
      });
    });
  }

  setLastRoll(value) {
    rafBatch(() => {
      this.e.lastRoll.textContent = value ?? "–";
      this.e.lastRoll.classList.remove("pop");
      if (value) {
        void this.e.lastRoll.offsetWidth;
        this.e.lastRoll.classList.add("pop");
        // color flash per roll
        if (value === 6) {
          this.e.lastRoll.animate([
            { boxShadow: "inset 0 0 0 2px rgba(255,209,102,.4)", transform:"scale(1)" },
            { boxShadow: "inset 0 0 0 2px rgba(255,209,102,.9), 0 0 18px rgba(255,209,102,.7)", transform:"scale(1.06)" },
            { boxShadow: "inset 0 0 0 2px rgba(255,209,102,.4)", transform:"scale(1)" }
          ], { duration: 420, easing:"cubic-bezier(.175,.885,.32,1.275)" });
        }
        setTimeout(()=> this.e.lastRoll.classList.remove("pop"), 500);
      }
    });
  }

  // ── Player cards ───────────────────────────────────────────
  renderPlayers(state) {
    this.e.cards.innerHTML = "";
    const frag = document.createDocumentFragment();
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
      frag.appendChild(card);
    }
    this.e.cards.appendChild(frag);
    this.update(state, {});
  }

  /**
   * Refresh cards for current state. Batched if called rapidly.
   * @param {object} opts - { status } status text override for active player
   */
  update(state, { status = null } = {}) {
    // Use RAF to coalesce multiple calls in one frame
    rafBatch(() => this._updateImmediate(state, status));
  }

  _updateImmediate(state, status) {
    for (const p of state.players) {
      const card = document.getElementById(`card-${p.color}`);
      if (!card) continue;
      const isActive = state.players[state.turnIndex] === p && p.rank === null;
      const wasActive = card.classList.contains("active");

      card.classList.toggle("active", isActive);
      card.classList.toggle("ranked", p.rank !== null);
      if (isActive && !wasActive) {
        card.animate([
          { transform:"scale(1)", boxShadow:"0 0 0 rgba(0,0,0,0)" },
          { transform:"scale(1.02)", boxShadow:`0 0 16px ${COLOR_META[p.color].hex}55` },
          { transform:"scale(1.015)", boxShadow:`0 0 14px ${COLOR_META[p.color].hex}66` }
        ], { duration: 420, easing:"cubic-bezier(.175,.885,.32,1.275)" });
      }

      const badge = card.querySelector(".rank-badge");
      if (p.rank !== null) {
        if (badge.hidden) {
          badge.hidden = false;
          badge.animate([
            { transform:"scale(.7)", opacity:0 },
            { transform:"scale(1.15)", opacity:1 },
            { transform:"scale(1)", opacity:1 }
          ], { duration: 360, easing:"cubic-bezier(.175,.885,.32,1.275)" });
        }
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
        const dot = dots[i];
        const cls = t.pos === FINISHED ? " home" : t.pos !== YARD ? " out" : "";
        if (dot.className !== "token-dot" + cls) {
          dot.className = "token-dot" + cls;
          if (cls) {
            dot.animate([
              { transform:"scale(.6)" }, { transform:"scale(1.22)" }, { transform:"scale(1)" }
            ], { duration: 280, easing:"cubic-bezier(.175,.885,.32,1.275)" });
          }
        }
      });

      const finished = state.finishedCount(p);
      const statsEl = card.querySelector(".player-stats");
      const newStats = `🏠 ${finished}/4<br>⚔️ ${p.stats.captures} · 6️⃣ ${p.stats.sixes}`;
      if (statsEl.innerHTML !== newStats) statsEl.innerHTML = newStats;

      const fill = card.querySelector(".progress-fill");
      const pct = `${Math.round(state.progressOf(p) * 100)}%`;
      if (fill.style.width !== pct) fill.style.width = pct;
    }
  }

  // ── Game log ───────────────────────────────────────────────
  log(message, color = "sys") {
    rafBatch(() => {
      const li = el("li", color);
      li.textContent = message;
      // Add subtle entrance
      li.style.opacity = "0";
      li.style.transform = "translateX(10px)";
      this.e.log.prepend(li);
      requestAnimationFrame(() => {
        li.style.transition = "opacity 260ms var(--ease-out), transform 260ms var(--ease-out)";
        li.style.opacity = "1";
        li.style.transform = "none";
        setTimeout(()=> li.style.transition="", 300);
      });
      while (this.e.log.children.length > this.maxLog) this.e.log.lastChild.remove();
    });
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
