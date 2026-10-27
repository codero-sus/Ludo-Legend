/* ═════════════════════════════════════════════════════════════
   board/TokenRenderer.js — HTML token pawns overlaid on SVG.
   + hint highlight, trail, explode, sparkle, path preview
   ═════════════════════════════════════════════════════════════ */
import { GRID } from "./BoardData.js";
import { cellKeyFor, cellCenterFor } from "./BoardData.js";
import { YARD, FINISHED, COLOR_META } from "../config/constants.js";
import { rafBatch } from "../core/perf.js";

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
  constructor(layer) {
    this.layer = layer;
    this.els = new Map();
    this.pickHandler = null;
    this.previewEls = [];
  }

  build(players) {
    this.layer.innerHTML = ""; this.els.clear();
    this.clearMovable(); this.clearPathPreview(); this.clearHint();
    const frag = document.createDocumentFragment();
    for (const p of players) {
      p.tokens.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.className = `token ${p.color}`;
        btn.dataset.color = p.color; btn.dataset.index = String(i);
        btn.setAttribute("aria-label", `${p.name} token ${i + 1}`);
        btn.innerHTML = `<span class="token-face">${COLOR_META[p.color].avatar}</span>`;
        btn.addEventListener("click", () => this.pickHandler?.(p.color, i), { passive: true });
        // keyboard: allow Enter/Space
        btn.addEventListener("keydown", (e)=>{ if(e.code==="Enter"||e.code==="Space"){ e.preventDefault(); this.pickHandler?.(p.color,i); }});
        frag.appendChild(btn);
        this.els.set(key(p.color, i), btn);
      });
    }
    this.layer.appendChild(frag);
    this.update({ players });
  }

  update(state) {
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
        el.style.left = `${(x / GRID) * 100}%`;
        el.style.top = `${(y / GRID) * 100}%`;
        const [ox, oy] = needsStack ? table[slot % table.length] : [0, 0];
        el.style.setProperty("--ox", `${ox}%`); el.style.setProperty("--oy", `${oy}%`);
        el.classList.toggle("stacked", needsStack);
        el.classList.toggle("finished", m.pos === FINISHED);
      });
    }
  }

  hop(color, idx) {
    const el = this.els.get(key(color, idx)); if (!el) return;
    el.classList.remove("token-hop"); void el.offsetWidth;
    el.classList.add("token-hop"); setTimeout(()=>el.classList.remove("token-hop"),300);
  }

  trail(color, idx, pos) {
    const src = this.els.get(key(color, idx)); if (!src) return;
    const dot = document.createElement("span");
    dot.className = "trail-dot";
    dot.style.left = src.style.left; dot.style.top = src.style.top;
    dot.style.background = `radial-gradient(circle, #fff, ${COLOR_META[color].hex})`;
    this.layer.appendChild(dot); setTimeout(()=>dot.remove(),520);
  }

  explode(color, idx) {
    const el = this.els.get(key(color, idx)); if (!el) return;
    const ring = document.createElement("span");
    ring.className = "capture-ring";
    ring.style.left = el.style.left; ring.style.top = el.style.top;
    ring.style.setProperty("--tsize", getComputedStyle(el).getPropertyValue("--tsize") || "5.6%");
    this.layer.appendChild(ring); setTimeout(()=>ring.remove(),650);
    el.classList.add("captured"); setTimeout(()=>el.classList.remove("captured"),600);
  }

  sparkle(color, idx) {
    const el = this.els.get(key(color, idx)); if (!el) return;
    el.classList.add("sparkle"); setTimeout(()=>el.classList.remove("sparkle"),1100);
    for(let i=0;i<3;i++){
      const s=document.createElement("span");
      s.textContent="✦"; s.style.position="absolute"; s.style.left=el.style.left; s.style.top=el.style.top;
      s.style.color=COLOR_META[color].hex; s.style.fontSize="14px";
      s.style.transform=`translate(-50%,-50%) translate(${(Math.random()-0.5)*30}px,-10px)`;
      s.style.animation=`sparkleTwirl ${600+Math.random()*300}ms ease-out forwards`;
      s.style.pointerEvents="none"; s.style.textShadow="0 0 8px var(--gold)";
      this.layer.appendChild(s); setTimeout(()=>s.remove(),1000);
    }
  }

  showPathPreview(color, movableIdxs, state, roll) {
    this.clearPathPreview();
    const player = state.players.find(p=>p.color===color); if(!player) return;
    const preview=[];
    for(const idx of movableIdxs){
      const token=player.tokens[idx];
      let positions=[];
      if(token.pos===YARD){ if(roll===6) positions=[0]; }
      else {
        if(token.pos+roll===FINISHED) positions=[FINISHED];
        else if(token.pos+roll < FINISHED) positions=Array.from({length:roll},(_,i)=>token.pos+1+i);
        else if(token.pos+roll===FINISHED) positions=[FINISHED];
      }
      for(const pos of positions){
        if(pos===FINISHED) continue;
        const {x,y}=cellCenterFor(color,pos,idx);
        const dot=document.createElement("span");
        dot.className="path-preview"; dot.style.left=`${(x/GRID)*100}%`; dot.style.top=`${(y/GRID)*100}%`;
        dot.style.background=COLOR_META[color].hex; dot.style.opacity="0.95";
        dot.style.animationDelay=`${Math.random()*0.4}s`;
        this.layer.appendChild(dot); preview.push(dot);
      }
    }
    requestAnimationFrame(()=>preview.forEach(d=>{ d.style.opacity="0.95"; d.style.transform="translate(-50%,-50%) scale(1)"; }));
    this.previewEls=preview;
  }
  clearPathPreview(){ this.previewEls.forEach(el=>el.remove()); this.previewEls=[]; }

  showHint(color, idx){
    this.clearHint();
    const el=this.els.get(key(color,idx));
    if(el) el.classList.add("hint-target");
    // auto clear after 3s
    this._hintTimer=setTimeout(()=>this.clearHint(), 3000);
  }
  clearHint(){
    clearTimeout(this._hintTimer);
    this.layer.querySelectorAll(".hint-target").forEach(n=>n.classList.remove("hint-target"));
  }

  setMovable(player, movableIdxs, onPick){
    this.clearMovable();
    this.pickHandler=(color,idx)=>{ if(color===player.color && movableIdxs.includes(idx)) onPick(idx); };
    for(const i of movableIdxs){ this.els.get(key(player.color,i))?.classList.add("movable"); }
    // also allow keyboard 1-4
    this._movableKeys = movableIdxs;
    this._movablePlayer = player.color;
  }
  clearMovable(){
    this.pickHandler=null;
    this.layer.querySelectorAll(".movable").forEach(n=>n.classList.remove("movable"));
    this._movableKeys=null;
  }

  spotlight(activeColor){
    rafBatch(()=>{
      for(const [k,el] of this.els) el.classList.toggle("dim", !k.startsWith(activeColor+":"));
    });
  }
  flashCapture(color, idx){
    const el=this.els.get(key(color,idx)); if(!el) return;
    el.classList.add("captured-flash"); setTimeout(()=>el.classList.remove("captured-flash"),1300);
  }
}
