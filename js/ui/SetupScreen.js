/* ═════════════════════════════════════════════════════════════
   ui/SetupScreen.js — pre-match configuration overlay.
   + AI difficulty per bot, theme preview, cached DOM, rAF, haptics
   ═════════════════════════════════════════════════════════════ */
import {
  COLOR_SETS, DEFAULT_RULES, RULE_DESCRIPTIONS,
  HUMAN_NAMES, BOT_NAMES, STORAGE_KEYS, DIFFICULTY, DEFAULT_DIFFICULTY
} from "../config/constants.js";
import { $, $$, el } from "../core/utils.js";

export class SetupScreen {
  constructor(els) {
    this.e = els;
    this.count = 4;
    this.rowState = [];
    this.rules = { ...DEFAULT_RULES };
    this.onStart = null;

    $$("button", this.e.countSeg).forEach((b) =>
      b.addEventListener("click", () => this.setCount(Number(b.dataset.count)), { passive: true }));
    this.e.quickBots.addEventListener("click", () =>
      this.applyPreset(["human", "bot", "bot", "bot"], ["You", ...BOT_NAMES.slice(0, 3)]), { passive: true });
    this.e.quickHumans.addEventListener("click", () =>
      this.applyPreset(["human", "human", "human", "human"], HUMAN_NAMES.slice(0, 4)), { passive: true });
    this.e.quickDemo.addEventListener("click", () =>
      this.applyPreset(["bot", "bot", "bot", "bot"], BOT_NAMES.slice(0, 4)), { passive: true });
    this.e.startBtn.addEventListener("click", () => this.#start(), { passive: true });
  }

  show() {
    const saved = this.#loadLastConfig();
    if (saved) {
      this.count = saved.players.length;
      this.rowState = saved.players.map((p) => ({ difficulty:DEFAULT_DIFFICULTY, ...p }));
      this.rules = { ...DEFAULT_RULES, ...saved.rules };
    } else {
      this.count = 4;
      this.rowState = COLOR_SETS[4].map((color, i) => ({
        color,
        name: i === 0 ? "You" : BOT_NAMES[i - 1] ?? `Player ${i + 1}`,
        type: i === 0 ? "human" : "bot",
        difficulty: DEFAULT_DIFFICULTY
      }));
      this.rules = { ...DEFAULT_RULES };
    }
    this.#syncCountSeg();
    this.#renderRows();
    this.#renderRules();
    this.e.overlay.classList.add("show");
    const dlg = this.e.overlay.querySelector(".dialog");
    if (dlg) {
      dlg.style.opacity = "0"; dlg.style.transform = "scale(.96) translateY(14px)";
      requestAnimationFrame(() => {
        dlg.style.transition = "opacity 320ms var(--ease-out), transform 360ms var(--ease-spring)";
        dlg.style.opacity = "1"; dlg.style.transform = "none";
        setTimeout(()=> dlg.style.transition="", 400);
      });
    }
  }

  hide() {
    const dlg = this.e.overlay.querySelector(".dialog");
    if (dlg) {
      dlg.style.transition = "opacity 200ms var(--ease-sharp), transform 200ms var(--ease-sharp)";
      dlg.style.opacity = "0"; dlg.style.transform = "scale(.97) translateY(8px)";
      setTimeout(() => {
        this.e.overlay.classList.remove("show");
        dlg.style.transition = ""; dlg.style.opacity=""; dlg.style.transform="";
      }, 180);
    } else this.e.overlay.classList.remove("show");
  }

  setCount(n) {
    this.count = n;
    const colors = COLOR_SETS[n];
    const next = colors.map((color, i) => {
      const prev = this.rowState.find((r) => r.color === color);
      if (prev) return prev;
      const taken = new Set(this.rowState.map((r) => r.name));
      const name = HUMAN_NAMES.find((nm) => !taken.has(nm)) ?? `Player ${i + 1}`;
      return { color, name, type: i === 0 ? "human" : "bot", difficulty: DEFAULT_DIFFICULTY };
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
    this.e.rows.animate([
      { transform:"scale(1)" }, { transform:"scale(1.01)" }, { transform:"scale(1)" }
    ], { duration: 300, easing:"cubic-bezier(.175,.885,.32,1.275)" });
  }

  #syncCountSeg() {
    $$("button", this.e.countSeg).forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.count) === this.count));
  }

  #renderRows() {
    this.e.rows.innerHTML = "";
    const frag = document.createDocumentFragment();
    this.rowState.forEach((row, i) => {
      const div = el("div", "setup-row");
      div.style.animationDelay = `${i*0.05}s`;
      const diffOptions = Object.entries(DIFFICULTY).map(([k,v]) =>
        `<option value="${k}" ${row.difficulty===k?"selected":""}>${v.icon} ${v.label}</option>`).join("");
      div.innerHTML = `
        <span class="color-dot ${row.color}"></span>
        <input maxlength="14" value="" placeholder="Player ${i + 1}" aria-label="Player ${i + 1} name" />
        <div class="type-toggle">
          <button class="human">🧑 Human</button>
          <button class="bot">🤖 Bot</button>
        </div>
        <select class="diff-select" aria-label="Difficulty" title="Bot difficulty" style="font-size:.76rem;padding:6px 6px;border-radius:8px;border:1px solid #d8cba8;background:#fffdf6;${row.type==="human"?"display:none":""}">${diffOptions}</select>`;
      const input = $("input", div);
      input.value = row.name;
      input.addEventListener("input", () => { row.name = input.value; }, { passive: true });
      const [humanBtn, botBtn] = $$(".type-toggle button", div);
      const sel = $("select.diff-select", div);
      sel.addEventListener("change", () => { row.difficulty = sel.value; }, { passive: true });
      const sync = () => {
        const isHuman = row.type === "human";
        humanBtn.classList.toggle("active", isHuman);
        botBtn.classList.toggle("active", !isHuman);
        sel.style.display = isHuman ? "none" : "";
      };
      humanBtn.addEventListener("click", () => { row.type = "human"; sync(); this.#bump(div); }, { passive: true });
      botBtn.addEventListener("click", () => { row.type = "bot"; sync(); this.#bump(div); }, { passive: true });
      sync();
      frag.appendChild(div);
    });
    this.e.rows.appendChild(frag);
  }

  #bump(el) {
    el.animate([
      { transform:"scale(1)" }, { transform:"scale(1.015)" }, { transform:"scale(1)" }
    ], { duration: 220, easing:"cubic-bezier(.175,.885,.32,1.275)" });
  }

  #renderRules() {
    this.e.rulesBox.innerHTML = "";
    const frag = document.createDocumentFragment();
    let idx=0;
    for (const [key, label] of Object.entries(RULE_DESCRIPTIONS)) {
      const btn = el("button", "rule-toggle" + (this.rules[key] ? " on" : ""), `
        <span class="switch"></span><span></span>`);
      btn.style.animationDelay = `${idx++*0.04}s`;
      btn.querySelector("span:last-child").textContent = label;
      btn.addEventListener("click", () => {
        this.rules[key] = !this.rules[key];
        btn.classList.toggle("on", this.rules[key]);
        btn.animate([
          { transform:"scale(1)" }, { transform:"scale(1.03)" }, { transform:"scale(1)" }
        ], { duration: 200, easing:"cubic-bezier(.175,.885,.32,1.275)" });
      }, { passive: true });
      frag.appendChild(btn);
    }
    this.e.rulesBox.appendChild(frag);
  }

  #start() {
    const players = this.rowState.map((r, i) => ({
      color: r.color,
      name: (r.name || "").trim() || `Player ${i + 1}`,
      type: r.type,
      difficulty: r.difficulty || DEFAULT_DIFFICULTY
    }));
    const config = { players, rules: { ...this.rules } };
    try { localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config)); } catch {}
    this.hide();
    setTimeout(() => this.onStart?.(config), 120);
  }

  #loadLastConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.config);
      if (!raw) return null;
      const cfg = JSON.parse(raw);
      if (!Array.isArray(cfg.players) || cfg.players.length < 2 || cfg.players.length > 4) return null;
      return cfg;
    } catch { return null; }
  }
}
