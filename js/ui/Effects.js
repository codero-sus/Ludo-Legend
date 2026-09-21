/* ═════════════════════════════════════════════════════════════
   ui/Effects.js — full-screen festive confetti (Diwali colours 🪔).
   ═════════════════════════════════════════════════════════════ */
import { rand, pick } from "../core/utils.js";

const COLORS = ["#ffd166", "#ef233c", "#2dc653", "#ffb703", "#4361ee", "#ff5d8f", "#ffffff"];

export class Effects {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.running = false;
    this.resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  /** Launch a confetti burst that lasts ~`ms`. */
  confettiBurst(ms = 4000) {
    const count = Math.min(260, Math.floor(window.innerWidth / 5));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: rand(0, this.canvas.width),
        y: rand(-this.canvas.height, 0),
        w: rand(6, 12),
        h: rand(8, 16),
        vy: rand(2, 5) + Math.random() * 2,
        vx: rand(-2, 2),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        color: pick(COLORS)
      });
    }
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(() => this.#tick());
    }
    setTimeout(() => { this.particles = []; }, ms);
  }

  #tick() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of this.particles) {
      p.x += p.vx + Math.sin(p.y / 40);
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = rand(0, canvas.width);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.#tick());
    } else {
      this.running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}
