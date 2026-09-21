/* ═════════════════════════════════════════════════════════════
   ui/SetupScreen.js — pre-match configuration overlay.
   Collects player count / names / types + house rules, emits config.
   ═════════════════════════════════════════════════════════════ */
import {
  COLOR_SETS, DEFAULT_RULES, RULE_DESCRIPTIONS,
  HUMAN_NAMES, BOT_NAMES, STORAGE_KEYS
} from "../config/constants.js";
import { $, $$, el } from "../core/utils.js";

export class SetupScreen {
  /**
   * @param {object} els - { overlay, rows, countSeg, rulesBox, startBtn,
   *   quickBots, quickHumans, quickDemo }
   */
  constructor(els) {
    this.e = els;
    this.count = 4;
    this.rowState = []; // { color, name, type }
    this.rules = { ...DEFAULT_RULES };
    this.onStart = null;

    $$("button", this.e.countSeg).forEach((b) =>
      b.addEventListener("click", () => this.setCount(Number(b.dataset.count))));
    this.e.quickBots.addEventListener("click", () =>
      this.applyPreset(["human", "bot", "bot", "bot"], ["You", ...BOT_NAMES.slice(0, 3)]));
    this.e.quickHumans.addEventListener("click", () =>
      this.applyPreset(["human", "human", "human", "human"], HUMAN_NAMES.slice(0, 4)));
    this.e.quickDemo.addEventListener("click", () =>
      this.applyPreset(["bot", "bot", "bot", "bot"], BOT_NAMES.slice(0, 4)));
    this.e.startBtn.addEventListener("click", () => this.#start());
  }

  /** Show the overlay, restoring last config when available. */
  show() {
    const saved = this.#loadLastConfig();
    if (saved) {
      this.count = saved.players.length;
      this.rowState = saved.players.map((p) => ({ ...p }));
      this.rules = { ...DEFAULT_RULES, ...saved.rules };
    } else {
      this.count = 4;
      this.rowState = COLOR_SETS[4].map((color, i) => ({
        color,
        name: i === 0 ? "You" : BOT_NAMES[i - 1] ?? `Player ${i + 1}`,
        type: i === 0 ? "human" : "bot"
      }));
      this.rules = { ...DEFAULT_RULES };
    }
    this.#syncCountSeg();
    this.#renderRows();
    this.#renderRules();
    this.e.overlay.classList.add("show");
  }

  hide() { this.e.overlay.classList.remove("show"); }

  setCount(n) {
    this.count = n;
    const colors = COLOR_SETS[n];
    const next = colors.map((color, i) => {
      const prev = this.rowState.find((r) => r.color === color);
      if (prev) return prev;
      const taken = new Set(this.rowState.map((r) => r.name));
      const name = HUMAN_NAMES.find((nm) => !taken.has(nm)) ?? `Player ${i + 1}`;
      return { color, name, type: i === 0 ? "human" : "bot" };
    });
    this.rowState = next;
    this.#syncCountSeg();
    this.#renderRows();
  }

  applyPreset(types, names) {
    this.setCount(4);
    this.rowState.forEach((r, i) => {
      r.type = types[i] ?? "human";
      r.name = names[i] ?? r.name;
    });
    this.#renderRows();
  }

  #syncCountSeg() {
    $$("button", this.e.countSeg).forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.count) === this.count));
  }

  #renderRows() {
    this.e.rows.innerHTML = "";
    this.rowState.forEach((row, i) => {
      const div = el("div", "setup-row");
      div.innerHTML = `
        <span class="color-dot ${row.color}"></span>
        <input maxlength="14" value="" placeholder="Player ${i + 1}" aria-label="Player ${i + 1} name" />
        <div class="type-toggle">
          <button class="human">🧑 Human</button>
          <button class="bot">🤖 Bot</button>
        </div>`;
      const input = $("input", div);
      input.value = row.name;
      input.addEventListener("input", () => { row.name = input.value; });
      const [humanBtn, botBtn] = $$(".type-toggle button", div);
      const sync = () => {
        humanBtn.classList.toggle("active", row.type === "human");
        botBtn.classList.toggle("active", row.type === "bot");
      };
      humanBtn.addEventListener("click", () => { row.type = "human"; sync(); });
      botBtn.addEventListener("click", () => { row.type = "bot"; sync(); });
      sync();
      this.e.rows.appendChild(div);
    });
  }

  #renderRules() {
    this.e.rulesBox.innerHTML = "";
    for (const [key, label] of Object.entries(RULE_DESCRIPTIONS)) {
      const btn = el("button", "rule-toggle" + (this.rules[key] ? " on" : ""), `
        <span class="switch"></span><span></span>`);
      btn.querySelector("span:last-child").textContent = label;
      btn.addEventListener("click", () => {
        this.rules[key] = !this.rules[key];
        btn.classList.toggle("on", this.rules[key]);
      });
      this.e.rulesBox.appendChild(btn);
    }
  }

  #start() {
    const players = this.rowState.map((r, i) => ({
      color: r.color,
      name: (r.name || "").trim() || `Player ${i + 1}`,
      type: r.type
    }));
    const config = { players, rules: { ...this.rules } };
    try { localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config)); } catch { /* ignore */ }
    this.hide();
    this.onStart?.(config);
  }

  #loadLastConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.config);
      if (!raw) return null;
      const cfg = JSON.parse(raw);
      if (!Array.isArray(cfg.players) || cfg.players.length < 2 || cfg.players.length > 4) return null;
      return cfg;
    } catch {
      return null;
    }
  }
}
