/* ═════════════════════════════════════════════════════════════
   ui/Modals.js — rules dialog + winner/standings dialog.
   ═════════════════════════════════════════════════════════════ */
import { COLOR_META } from "../config/constants.js";
import { el } from "../core/utils.js";

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣"];

export class Modals {
  /**
   * @param {object} els - { rulesOverlay, winnerOverlay, winnerTitle,
   *   winnerSub, standings, continueBtn, winnerNewBtn }
   * @param {HUD} hud - reused for standings ordering
   */
  constructor(els, hud) {
    this.e = els;
    this.hud = hud;
    document.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", () => document.getElementById(b.dataset.close)?.classList.remove("show")));
    this.e.rulesOverlay.addEventListener("click", (ev) => {
      if (ev.target === this.e.rulesOverlay) this.closeRules();
    });
  }

  openRules() { this.e.rulesOverlay.classList.add("show"); }
  closeRules() { this.e.rulesOverlay.classList.remove("show"); }
  toggleRules() { this.e.rulesOverlay.classList.toggle("show"); }

  /**
   * @param {object} opts - { player, state, isFinal, onContinue, onNewGame }
   */
  showWinner({ player, state, isFinal, onContinue, onNewGame }) {
    const meta = COLOR_META[player.color];
    this.e.winnerTitle.textContent = isFinal
      ? `${meta.avatar} ${player.name} wins!`
      : `${meta.avatar} ${player.name} finishes #${player.rank}!`;
    this.e.winnerSub.textContent = isFinal
      ? "Champion of the board! 🎉"
      : "The race continues for the remaining places…";

    this.e.standings.innerHTML = "";
    this.hud.standings(state).forEach((p, i) => {
      const row = el("div", "standing");
      row.innerHTML = `<span class="medal">${MEDALS[i] ?? "🏅"}</span>
        <span class="st-name"></span><span class="st-detail"></span>`;
      row.querySelector(".st-name").textContent =
        `${COLOR_META[p.color].avatar} ${p.name}${p.rank ? `  •  #${p.rank}` : ""}`;
      row.querySelector(".st-detail").textContent =
        `🏠 ${state.finishedCount(p)}/4 · ⚔️ ${p.stats.captures} · 6️⃣ ${p.stats.sixes}`;
      this.e.standings.appendChild(row);
    });

    this.e.continueBtn.style.display = isFinal ? "none" : "";
    this.e.continueBtn.onclick = () => {
      this.e.winnerOverlay.classList.remove("show");
      onContinue?.();
    };
    this.e.winnerNewBtn.onclick = () => {
      this.e.winnerOverlay.classList.remove("show");
      onNewGame?.();
    };
    this.e.winnerOverlay.classList.add("show");
  }
}
