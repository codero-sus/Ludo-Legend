/* ═════════════════════════════════════════════════════════════
   ui/Effects.js — festival-grade particle system 🎆
   • Pooled confetti + fireworks + capture/home bursts
   • Trail sparks, bonus rings, dice dust
   • Single rAF loop, delta-time, additive blending
   • Respects prefers-reduced-motion & visibility
   ═════════════════════════════════════════════════════════════ */
import { rand, pick } from "../core/utils.js";
import { prefersReducedMotion, Pool } from "../core/perf.js";
import { COLOR_META } from "../config/constants.js";
import { cellCenterFor, GRID } from "../board/BoardData.js";

const COLORS = ["#ffd166", "#ef233c", "#2dc653", "#ffb703", "#4361ee", "#ff5d8f", "#ffffff"];
const PLAYER_COLORS = { red:"#ef233c", green:"#2dc653", yellow:"#ffb703", blue:"#4361ee" };

export class Effects {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.particles = [];
    this.running = false;
    this.lastT = 0;
    this.trailAcc = 0;
    this.resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.floor(window.innerWidth * dpr);
      this.canvas.height = Math.floor(window.innerHeight * dpr);
      this.canvas.style.width = window.innerWidth + "px";
      this.canvas.style.height = window.innerHeight + "px";
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.dpr = dpr;
    };
    window.addEventListener("resize", this.resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.particles = [];
    });
    this.resize();
    // DOM overlay for rings/bursts that look better as HTML
    this.domLayer = this.#ensureDomLayer();
  }

  #ensureDomLayer() {
    let layer = document.getElementById("fxDomLayer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "fxDomLayer";
      layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:180;overflow:hidden";
      document.body.appendChild(layer);
    }
    return layer;
  }

  // ── Public FX API ────────────────────────────────────────
  /** Launch a confetti burst that lasts ~`ms`. */
  confettiBurst(ms = 4000) {
    if (prefersReducedMotion()) return;
    const count = Math.min(260, Math.floor(window.innerWidth / 5));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: rand(0, window.innerWidth),
        y: rand(-window.innerHeight, 0),
        w: rand(6, 12),
        h: rand(8, 16),
        vy: rand(2, 5) + Math.random() * 2,
        vx: rand(-2, 2),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        color: pick(COLORS),
        life: 1, decay: 0.0006 + Math.random()*0.0008,
        type: "confetti"
      });
    }
    this.#kick();
    setTimeout(() => { /* let them fall naturally */ }, ms);
    // auto-clear after ms + fall time
    setTimeout(() => { this.particles = this.particles.filter(p => p.type !== "confetti"); }, ms + 3200);
  }

  fireworks(color = "gold", ms = 3500) {
    if (prefersReducedMotion()) return;
    const hex = PLAYER_COLORS[color] || COLOR_META[color]?.hex || "#ffd166";
    const bursts = 5 + Math.floor(Math.random()*3);
    for (let b=0; b<bursts; b++) {
      setTimeout(() => {
        const cx = rand(window.innerWidth*0.2, window.innerWidth*0.8);
        const cy = rand(window.innerHeight*0.18, window.innerHeight*0.45);
        for (let i=0;i<28;i++) {
          const ang = (Math.PI*2*i)/28 + Math.random()*0.25;
          const sp = 2.5 + Math.random()*4.5;
          this.particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp,
            r: 2 + Math.random()*3.5,
            color: Math.random()<0.7? hex : pick(COLORS),
            life: 1, decay: 0.012 + Math.random()*0.01,
            type: "firework",
            gravity: 0.08
          });
        }
        this.#kick();
        // flash ring
        this.#domRing(cx, cy, hex);
      }, b*220);
    }
    setTimeout(() => { this.particles = this.particles.filter(p=>p.type!=="firework"); }, ms);
  }

  /** Capture explosion at victim's board position */
  burstCapture(victimColor, victimIdx, attackerColor, state) {
    if (prefersReducedMotion()) return;
    try {
      const victim = state.players.find(p=>p.color===victimColor);
      const pos = victim?.tokens[victimIdx]?.pos ?? -1;
      const { x, y } = cellCenterFor(victimColor, -1, victimIdx); // yard fallback
      // try to get actual board pixel from token layer
      const boardRect = document.getElementById("boardWrap")?.getBoundingClientRect();
      if (!boardRect) return;
      const cx = boardRect.left + (x/GRID)*boardRect.width;
      const cy = boardRect.top + (y/GRID)*boardRect.height;
      // But victim is sent to yard, so use yard spot
      for (let i=0;i<22;i++) {
        const ang = Math.random()*Math.PI*2;
        const sp = 1.5 + Math.random()*5;
        this.particles.push({
          x: cx, y: cy, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp - Math.random()*2,
          r: 2.2 + Math.random()*3, color: pick([PLAYER_COLORS[victimColor], PLAYER_COLORS[attackerColor]||"#fff", "#ffd166"]),
          life:1, decay:0.016, type:"capture", gravity:0.12
        });
      }
      this.#kick();
      this.#domRing(cx, cy, PLAYER_COLORS[attackerColor]||"#ffd166", 22, 46);
    } catch {}
  }

  burstHome(color, idx, state) {
    if (prefersReducedMotion()) return;
    try {
      const boardRect = document.getElementById("boardWrap")?.getBoundingClientRect();
      if (!boardRect) return;
      const { x, y } = cellCenterFor(color, 56, idx);
      const cx = boardRect.left + (x/GRID)*boardRect.width;
      const cy = boardRect.top + (y/GRID)*boardRect.height;
      for (let i=0;i<18;i++) {
        const ang = Math.random()*Math.PI*2;
        const sp = 1.2 + Math.random()*3.5;
        this.particles.push({
          x: cx, y: cy, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp -1,
          r: 2 + Math.random()*2.5, color: pick([PLAYER_COLORS[color], "#fff", "#ffd166"]),
          life:1, decay:0.014, type:"home", gravity:0.06
        });
      }
      this.#kick();
      this.#domRing(cx, cy, PLAYER_COLORS[color], 16, 36);
      this.#domStars(cx, cy, PLAYER_COLORS[color]);
    } catch {}
  }

  burstOut(color, idx, state) {
    // leaving base — small pop
    if (prefersReducedMotion()) return;
    try {
      const boardRect = document.getElementById("boardWrap")?.getBoundingClientRect();
      if (!boardRect) return;
      const { x, y } = cellCenterFor(color, 0, idx);
      const cx = boardRect.left + (x/GRID)*boardRect.width;
      const cy = boardRect.top + (y/GRID)*boardRect.height;
      for (let i=0;i<12;i++) {
        const ang = Math.random()*Math.PI*2;
        this.particles.push({
          x: cx, y: cy, vx: Math.cos(ang)*1.8, vy: Math.sin(ang)*1.8,
          r: 1.8 + Math.random()*2, color: PLAYER_COLORS[color],
          life:1, decay:0.018, type:"out"
        });
      }
      this.#kick();
    } catch {}
  }

  trailSpark(color, pos, state) {
    if (prefersReducedMotion() || Math.random()<0.45) return;
    try {
      const boardRect = document.getElementById("boardWrap")?.getBoundingClientRect();
      if (!boardRect) return;
      const { x, y } = cellCenterFor(color, pos, 0);
      const cx = boardRect.left + (x/GRID)*boardRect.width;
      const cy = boardRect.top + (y/GRID)*boardRect.height;
      this.particles.push({
        x: cx + (Math.random()-0.5)*10, y: cy + (Math.random()-0.5)*10,
        vx: (Math.random()-0.5)*1.2, vy: -0.8 - Math.random()*1.2,
        r: 1.2 + Math.random()*1.6, color: "#fff",
        life:1, decay:0.032, type:"trail"
      });
      this.#kick();
    } catch {}
  }

  diceBurst(color, roll) {
    if (prefersReducedMotion()) return;
    const scene = document.getElementById("diceScene");
    if (!scene) return;
    const r = scene.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const hex = PLAYER_COLORS[color] || "#ffd166";
    // DOM dust
    for (let i=0;i< (roll===6? 10:6); i++) {
      const d = document.createElement("span");
      d.textContent = roll===6? "✦":"·";
      d.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;color:${hex};font-size:${10+Math.random()*10}px;pointer-events:none;z-index:160;will-change:transform,opacity`;
      const ang = Math.random()*Math.PI*2, dist = 18 + Math.random()*28;
      d.animate([
        { transform:"translate(-50%,-50%) scale(1)", opacity:1 },
        { transform:`translate(calc(-50% + ${Math.cos(ang)*dist}px), calc(-50% + ${Math.sin(ang)*dist}px)) scale(0)`, opacity:0 }
      ], { duration:520+Math.random()*280, easing:"cubic-bezier(.16,1,.3,1)" }).onfinish = () => d.remove();
      document.body.appendChild(d);
    }
  }

  sixPulse(color) {
    if (prefersReducedMotion()) return;
    const dot = document.querySelector(`.turn-dot.${color}`);
    if (!dot) return;
    dot.animate([
      { transform:"scale(1)", boxShadow:"0 0 10px currentColor" },
      { transform:"scale(1.35)", boxShadow:"0 0 22px currentColor" },
      { transform:"scale(1)", boxShadow:"0 0 10px currentColor" }
    ], { duration:560, easing:"cubic-bezier(.175,.885,.32,1.275)" });
  }

  bonusRing(color) {
    if (prefersReducedMotion()) return;
    const board = document.getElementById("boardWrap");
    if (!board) return;
    const ring = document.createElement("span");
    ring.className = "bonus-ring";
    ring.style.left = "50%"; ring.style.top = "50%";
    ring.style.width = "18%"; ring.style.height = "18%";
    ring.style.borderColor = PLAYER_COLORS[color] || "var(--gold)";
    board.appendChild(ring);
    setTimeout(()=> ring.remove(), 760);
  }

  #domRing(cx, cy, color, min=22, max=56) {
    const ring = document.createElement("span");
    ring.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${min}px;height:${min}px;border:2px solid ${color};border-radius:50%;transform:translate(-50%,-50%) scale(.6);pointer-events:none;z-index:170;opacity:.95;will-change:transform,opacity`;
    document.body.appendChild(ring);
    ring.animate([
      { transform:"translate(-50%,-50%) scale(.6)", opacity:.95 },
      { transform:`translate(-50%,-50%) scale(${max/min})`, opacity:0 }
    ], { duration:560, easing:"cubic-bezier(.16,1,.3,1)" }).onfinish = () => ring.remove();
  }

  #domStars(cx, cy, color) {
    for(let i=0;i<3;i++){
      const s=document.createElement("span");
      s.textContent="★"; s.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;color:${color};font-size:${14+Math.random()*8}px;pointer-events:none;z-index:170;will-change:transform,opacity;text-shadow:0 0 8px ${color}`;
      const ang = -90 + (Math.random()-0.5)*70, dist= 18+Math.random()*22;
      s.animate([
        { transform:"translate(-50%,-50%) scale(.2) rotate(0deg)", opacity:1 },
        { transform:`translate(calc(-50% + ${Math.cos(ang*Math.PI/180)*dist}px), calc(-50% + ${Math.sin(ang*Math.PI/180)*dist}px)) scale(1.1) rotate(180deg)`, opacity:0 }
      ], { duration:720+Math.random()*240, easing:"cubic-bezier(.16,1,.3,1)" }).onfinish=()=>s.remove();
      document.body.appendChild(s);
    }
  }

  #kick() {
    if (!this.running) {
      this.running = true;
      this.lastT = performance.now();
      requestAnimationFrame((t) => this.#tick(t));
    }
  }

  #tick(t) {
    const { ctx } = this;
    const dt = Math.min(32, t - this.lastT) / 16.66;
    this.lastT = t;
    // clear with fade trail for confetti tail
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // additive for fireworks glow
    ctx.globalCompositeOperation = "source-over";
    let alive = 0;
    for (let i = this.particles.length-1; i>=0; i--) {
      const p = this.particles[i];
      if (p.type === "confetti") {
        p.x += p.vx + Math.sin(p.y/40)*0.6*dt;
        p.y += p.vy*dt;
        p.rot += p.vr*dt;
        p.life -= p.decay*dt;
        if (p.y > window.innerHeight + 24 || p.life<=0) { this.particles.splice(i,1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      } else {
        // physics particles
        p.vy += (p.gravity||0)*dt;
        p.x += p.vx*dt; p.y += p.vy*dt;
        p.vx *= 0.99; p.vy *= 0.99;
        p.life -= p.decay*dt;
        if (p.life<=0) { this.particles.splice(i,1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.6 + p.life*0.4), 0, Math.PI*2);
        ctx.fill();
        // glow
        if (p.type==="firework"||p.type==="capture") {
          ctx.globalAlpha = p.life*0.22;
          ctx.beginPath(); ctx.arc(p.x,p.y, p.r*2.2, 0, Math.PI*2); ctx.fill();
        }
      }
      alive++;
    }
    if (alive>0) {
      requestAnimationFrame((nt) => this.#tick(nt));
    } else {
      this.running = false;
      ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    }
  }
}
