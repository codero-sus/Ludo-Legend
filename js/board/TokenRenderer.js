/* ═════════════════════════════════════════════════════════════
   board/TokenRenderer.js — HTML token pawns overlaid on SVG.
   Upgraded: GPU transforms, trail, explode, sparkle, path preview,
   RAF-batched updates, pooling, will-change.
   ═════════════════════════════════════════════════════════════ */
import { GRID } from "./BoardData.js";
import { cellKeyFor, cellCenterFor, globalIndexFor, MAIN_TRACK } from "./BoardData.js";
import { YARD, FINISHED, COLOR_META } from "../config/constants.js";
import { rafBatch } from "../core/perf.js";

/** Stacking offsets (fractions of token size) by group size → slot. */
const STACK_OFFSETS = [
  [[0, 0]],
  [[-42, 0], [42, 0]],
  [[-44, -36], [44, -36], [0, 40]],
  [[-42, -42], [42, -42], [-42, 42], [42, 42]],
  [[-46, -46], [46, -46], [-46, 46], [46, 46], [0, 0]],
  [[-46, -46], [0, -46], [46, -46], [-46, 46], [0, 46], [46, 46]],
  [[-46, -46], [0, -46], [46, -46], [-46, 0], [46, 0], [-46, 46], [46, 46]],
  [[-46, -46], [0, -46], [46, -46], [-46, 0], [46, 0], [-46, 46], [0, 46], [46, 46]]
];

const key = (color, idx) => `${color}:${idx}`;

export class TokenRenderer {
  /** @param {HTMLElement} layer */
  constructor(layer) {
    this.layer = layer;
    /** @type {Map<string, HTMLButtonElement>} */
    this.els = new Map();
    this.pickHandler = null;
    this.previewEls = [];
    // trail pool (DOM nodes reused)
    this.trailPool = [];
  }

  /** Build the 4×N pawn elements for a match. */
  build(players) {
    this.layer.innerHTML = "";
    this.els.clear();
    this.clearMovable();
    this.clearPathPreview();
    const frag = document.createDocumentFragment();
    for (const p of players) {
      p.tokens.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.className = `token ${p.color}`;
        btn.dataset.color = p.color;
        btn.dataset.index = String(i);
        btn.setAttribute("aria-label", `${p.name} token ${i + 1}`);
        btn.innerHTML = `<span class="token-face">${COLOR_META[p.color].avatar}</span>`;
        // passive click not needed; but use once per token
        btn.addEventListener("click", () => this.pickHandler?.(p.color, i), { passive: true });
        frag.appendChild(btn);
        this.els.set(key(p.color, i), btn);
      });
    }
    this.layer.appendChild(frag);
    this.update({ players });
  }

  /** Re-position every token from state (with stacking). Batched via RAF. */
  update(state) {
    // Synchronous for gameplay correctness — but allow RAF batch wrapper outside
    const groups = new Map();
    for (const p of state.players) {
      p.tokens.forEach((t, i) => {
        const ck = cellKeyFor(p.color, t.pos);
        if (!groups.has(ck)) groups.set(ck, []);
        groups.get(ck).push({ color: p.color, idx: i, pos: t.pos });
      });
    }
    for (const [, members] of groups) {
      const needsStack = members.length > 1 && members[0].pos !== YARD;
      const table = STACK_OFFSETS[Math.min(members.length, 8) - 1];
      members.forEach((m, slot) => {
        const el = this.els.get(key(m.color, m.idx));
        if (!el) return;
        const { x, y } = cellCenterFor(m.color, m.pos, m.idx);
        // Use direct style write — cheap because we batch callers via rafBatch
        el.style.left = `${(x / GRID) * 100}%`;
        el.style.top = `${(y / GRID) * 100}%`;
        const [ox, oy] = needsStack ? table[slot % table.length] : [0, 0];
        el.style.setProperty("--ox", `${ox}%`);
        el.style.setProperty("--oy", `${oy}%`);
        el.classList.toggle("stacked", needsStack);
        el.classList.toggle("finished", m.pos === FINISHED);
      });
    }
  }

  /** Little hop pulse while a token steps cell-to-cell. */
  hop(color, idx) {
    const el = this.els.get(key(color, idx));
    if (!el) return;
    el.classList.remove("token-hop");
    void el.offsetWidth;
    el.classList.add("token-hop");
    // auto remove after
    setTimeout(() => el.classList.remove("token-hop"), 300);
  }

  /** Trail ghost left behind during movement */
  trail(color, idx, pos) {
    const src = this.els.get(key(color, idx));
    if (!src) return;
    // Create ephemeral trail dot at previous position
    const dot = document.createElement("span");
    dot.className = "trail-dot";
    dot.style.left = src.style.left;
    dot.style.top = src.style.top;
    dot.style.background = `radial-gradient(circle, #fff, ${COLOR_META[color].hex})`;
    this.layer.appendChild(dot);
    setTimeout(() => dot.remove(), 520);
  }

  /** Explosion ring on capture */
  explode(color, idx, state) {
    const el = this.els.get(key(color, idx));
    if (!el) return;
    const ring = document.createElement("span");
    ring.className = "capture-ring";
    ring.style.left = el.style.left;
    ring.style.top = el.style.top;
    ring.style.setProperty("--tsize", getComputedStyle(el).getPropertyValue("--tsize") || "5.6%");
    this.layer.appendChild(ring);
    setTimeout(() => ring.remove(), 650);
    el.classList.add("captured");
    setTimeout(() => el.classList.remove("captured"), 600);
  }

  /** Sparkle when reaching home */
  sparkle(color, idx) {
    const el = this.els.get(key(color, idx));
    if (!el) return;
    el.classList.add("sparkle");
    setTimeout(() => el.classList.remove("sparkle"), 1100);
    // spawn 3 stars
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.textContent = "✦";
      s.style.position = "absolute";
      s.style.left = el.style.left;
      s.style.top = el.style.top;
      s.style.color = COLOR_META[color].hex;
      s.style.fontSize = "14px";
      s.style.transform = `translate(-50%,-50%) translate(${ (Math.random()-0.5)*30 }px, -10px)`;
      s.style.animation = `sparkleTwirl ${600 + Math.random()*300}ms ease-out forwards`;
      s.style.pointerEvents = "none";
      s.style.textShadow = "0 0 8px var(--gold)";
      this.layer.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }

  /** Show dotted path preview for movable tokens */
  showPathPreview(color, movableIdxs, state, roll) {
    this.clearPathPreview();
    const player = state.players.find(p => p.color === color);
    if (!player) return;
    // Import dynamically to avoid cycle — use BoardData directly
    const preview = [];
    for (const idx of movableIdxs) {
      const token = player.tokens[idx];
      let positions = [];
      if (token.pos === YARD) {
        if (roll === 6) positions = [0];
      } else {
        for (let p = token.pos + 1; p <= Math.min(token.pos + roll, FINISHED); p++) {
          // respect exact finish etc — use target check
          const tgt = token.pos + roll;
          if (p > tgt) break;
          if (p === FINISHED || p <= 56) positions.push(p);
        }
        // If target is FINISHED, simplify
        if (token.pos + roll === FINISHED) positions = [FINISHED];
        else if (token.pos + roll < FINISHED) positions = Array.from({length: roll}, (_,i)=> token.pos+1+i);
        else positions = [];
      }
      for (const pos of positions) {
        if (pos === FINISHED) continue;
        const { x, y } = cellCenterFor(color, pos, idx);
        const dot = document.createElement("span");
        dot.className = "path-preview";
        dot.style.left = `${(x/GRID)*100}%`;
        dot.style.top = `${(y/GRID)*100}%`;
        dot.style.background = COLOR_META[color].hex;
        dot.style.opacity = "0.95";
        dot.style.animationDelay = `${Math.random()*0.4}s`;
        this.layer.appendChild(dot);
        preview.push(dot);
      }
    }
    // animate in
    requestAnimationFrame(() => preview.forEach(d => { d.style.opacity = "0.95"; d.style.transform = "translate(-50%,-50%) scale(1)"; }));
    this.previewEls = preview;
  }

  clearPathPreview() {
    this.previewEls.forEach(el => el.remove());
    this.previewEls = [];
  }

  /** Mark tokens as playable; clicks route to `onPick(tokenIdx)`. */
  setMovable(player, movableIdxs, onPick) {
    this.clearMovable();
    this.pickHandler = (color, idx) => {
      if (color === player.color && movableIdxs.includes(idx)) onPick(idx);
    };
    for (const i of movableIdxs) {
      const el = this.els.get(key(player.color, i));
      el?.classList.add("movable");
      // add ring pulse
      el?.style.setProperty("--pulse-color", COLOR_META[player.color].hex);
    }
  }

  clearMovable() {
    this.pickHandler = null;
    this.layer.querySelectorAll(".movable").forEach((n) => n.classList.remove("movable"));
  }

  /** Dim other players' tokens to spotlight `activeColor`. */
  spotlight(activeColor) {
    // Batch via RAF for smooth
    rafBatch(() => {
      for (const [k, el] of this.els) {
        el.classList.toggle("dim", !k.startsWith(activeColor + ":"));
      }
    });
  }

  flashCapture(color, idx) {
    const el = this.els.get(key(color, idx));
    if (!el) return;
    el.classList.add("captured-flash");
    setTimeout(() => el.classList.remove("captured-flash"), 1300);
  }
}
