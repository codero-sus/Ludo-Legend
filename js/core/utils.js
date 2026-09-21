/* ═════════════════════════════════════════════════════════════
   core/utils.js — tiny shared helpers (no game logic here)
   ═════════════════════════════════════════════════════════════ */

/** Promise-based sleep. */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Random int in [min, max]. */
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick a random element. */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Shorthand query selectors. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Create an element with optional class + html. */
export function el(tag, className = "", html = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

/** Clamp a number. */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
