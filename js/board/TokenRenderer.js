/* ═════════════════════════════════════════════════════════════
   board/TokenRenderer.js — HTML token pawns overlaid on the SVG board.
   Handles positioning, stacking offsets, highlights & hop animation.
   ═════════════════════════════════════════════════════════════ */
import { GRID } from "./BoardData.js";
import { cellKeyFor, cellCenterFor } from "./BoardData.js";
import { YARD, FINISHED, COLOR_META } from "../config/constants.js";

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
  }

  /** Build the 4×N pawn elements for a match. */
  build(players) {
    this.layer.innerHTML = "";
    this.els.clear();
    this.clearMovable();
    for (const p of players) {
      p.tokens.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.className = `token ${p.color}`;
        btn.dataset.color = p.color;
        btn.dataset.index = i;
        btn.setAttribute("aria-label", `${p.name} token ${i + 1}`);
        btn.innerHTML = `<span class="token-face">${COLOR_META[p.color].avatar}</span>`;
        btn.addEventListener("click", () => this.pickHandler?.(p.color, i));
        this.layer.appendChild(btn);
        this.els.set(key(p.color, i), btn);
      });
    }
    this.update({ players });
  }

  /** Re-position every token from state (with stacking). */
  update(state) {
    // Group tokens by physical cell for stacking offsets
    const groups = new Map();
    for (const p of state.players) {
      p.tokens.forEach((t, i) => {
        const ck = cellKeyFor(p.color, t.pos);
        if (!groups.has(ck)) groups.set(ck, []);
        groups.get(ck).push({ color: p.color, idx: i, pos: t.pos });
      });
    }
    for (const [, members] of groups) {
      // Yard spots are already unique — no stacking needed there
      const needsStack = members.length > 1 && members[0].pos !== YARD;
      const table = STACK_OFFSETS[Math.min(members.length, 8) - 1];
      members.forEach((m, slot) => {
        const el = this.els.get(key(m.color, m.idx));
        if (!el) return;
        const { x, y } = cellCenterFor(m.color, m.pos, m.idx);
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
    void el.offsetWidth; // restart animation
    el.classList.add("token-hop");
  }

  /** Mark tokens as playable; clicks route to `onPick(tokenIdx)`. */
  setMovable(player, movableIdxs, onPick) {
    this.clearMovable();
    this.pickHandler = (color, idx) => {
      if (color === player.color && movableIdxs.includes(idx)) onPick(idx);
    };
    for (const i of movableIdxs) {
      this.els.get(key(player.color, i))?.classList.add("movable");
    }
  }

  clearMovable() {
    this.pickHandler = null;
    this.layer.querySelectorAll(".movable").forEach((n) => n.classList.remove("movable"));
  }

  /** Dim other players' tokens to spotlight `activeColor`. */
  spotlight(activeColor) {
    for (const [k, el] of this.els) {
      el.classList.toggle("dim", !k.startsWith(activeColor + ":"));
    }
  }

  flashCapture(color, idx) {
    const el = this.els.get(key(color, idx));
    if (!el) return;
    el.classList.add("captured-flash");
    setTimeout(() => el.classList.remove("captured-flash"), 1300);
  }
}
