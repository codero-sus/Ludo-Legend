/* ═════════════════════════════════════════════════════════════
   features/AudioFX.js — tiny WebAudio synth for game sounds.
   No audio assets needed; everything is generated.
   ═════════════════════════════════════════════════════════════ */
import { STORAGE_KEYS } from "../config/constants.js";

export class AudioFX {
  constructor() {
    this.enabled = (localStorage.getItem(STORAGE_KEYS.sound) ?? "on") === "on";
    this.ctx = null;
  }

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx?.state === "suspended") this.ctx.resume().catch(() => {});
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEYS.sound, this.enabled ? "on" : "off");
    return this.enabled;
  }

  #tone({ freq = 440, end = null, dur = 0.12, type = "sine", vol = 0.18, delay = 0 }) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (end) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch { /* ignore */ }
  }

  #noise({ dur = 0.15, vol = 0.12, delay = 0 }) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(gain).connect(this.ctx.destination);
      src.start(t0);
    } catch { /* ignore */ }
  }

  // ── Game sounds ────────────────────────────────────────────
  click()   { this.#tone({ freq: 660, dur: 0.06, type: "triangle", vol: 0.12 }); }
  dice()    { for (let i = 0; i < 5; i++) this.#noise({ dur: 0.05, vol: 0.14, delay: i * 0.09 }); }
  hop(step = 0) { this.#tone({ freq: 420 + (step % 8) * 45, end: 700 + (step % 8) * 45, dur: 0.09, type: "sine", vol: 0.14 }); }
  six()     { [523, 659, 784].forEach((f, i) => this.#tone({ freq: f, dur: 0.12, type: "triangle", vol: 0.16, delay: i * 0.07 })); }
  capture() { this.#tone({ freq: 700, end: 120, dur: 0.35, type: "sawtooth", vol: 0.16 }); this.#noise({ dur: 0.2, vol: 0.1 }); }
  home()    { [392, 523, 659, 784].forEach((f, i) => this.#tone({ freq: f, dur: 0.14, type: "sine", vol: 0.16, delay: i * 0.08 })); }
  badLuck() { this.#tone({ freq: 300, end: 140, dur: 0.3, type: "square", vol: 0.08 }); }
  turn()    { this.#tone({ freq: 880, dur: 0.07, type: "sine", vol: 0.1 }); }
  win() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      this.#tone({ freq: f, dur: 0.22, type: "triangle", vol: 0.18, delay: i * 0.13 }));
  }
}
