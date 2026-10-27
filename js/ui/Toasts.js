/* ═════════════════════════════════════════════════════════════
   ui/Toasts.js — stackable notification popups (top-right).
   Upgraded: progress bar, icon, queue, rAF, will-change.
   ═════════════════════════════════════════════════════════════ */
import { el } from "../core/utils.js";

export class Toasts {
  /** @param {HTMLElement} box */
  constructor(box) {
    this.box = box;
    this.queue = [];
  }

  /**
   * @param {string} message
   * @param {'red'|'green'|'yellow'|'blue'|'gold'} type
   * @param {number} ms - auto-dismiss delay
   */
  show(message, type = "gold", ms = 2600) {
    const toast = el("div", `toast ${type}`);
    toast.style.setProperty("--toast-dur", ms + "ms");
    // icon per type
    const icons = { red:"🔴", green:"🟢", yellow:"🟡", blue:"🔵", gold:"✨" };
    toast.innerHTML = `<span style="margin-right:6px">${icons[type]||"✨"}</span><span></span>`;
    toast.lastChild.textContent = message;
    // entrance
    toast.style.opacity = "0";
    toast.style.transform = "translateX(18px) scale(.98)";
    this.box.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transition = "opacity 220ms var(--ease-out), transform 220ms var(--ease-spring)";
      toast.style.opacity = "1";
      toast.style.transform = "none";
      setTimeout(()=> toast.style.transition="", 260);
    });
    while (this.box.children.length > 4) this.box.firstChild.remove();
    // subtle pop for important
    if (type !== "gold" || message.includes("⚔️") || message.includes("🏠")) {
      toast.animate([
        { transform:"scale(1)" }, { transform:"scale(1.02)" }, { transform:"scale(1)" }
      ], { duration: 420, easing:"cubic-bezier(.175,.885,.32,1.275)" });
    }
    setTimeout(() => {
      toast.classList.add("out");
      setTimeout(() => toast.remove(), 350);
    }, ms);
  }
}
