/* ═════════════════════════════════════════════════════════════
   ui/Toasts.js — stackable notification popups (top-right).
   ═════════════════════════════════════════════════════════════ */
import { el } from "../core/utils.js";

export class Toasts {
  /** @param {HTMLElement} box */
  constructor(box) {
    this.box = box;
  }

  /**
   * @param {string} message
   * @param {'red'|'green'|'yellow'|'blue'|'gold'} type
   * @param {number} ms - auto-dismiss delay
   */
  show(message, type = "gold", ms = 2600) {
    const toast = el("div", `toast ${type}`);
    toast.textContent = message;
    this.box.appendChild(toast);
    while (this.box.children.length > 4) this.box.firstChild.remove();
    setTimeout(() => {
      toast.classList.add("out");
      setTimeout(() => toast.remove(), 350);
    }, ms);
  }
}
