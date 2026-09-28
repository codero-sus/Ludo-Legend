/* ═════════════════════════════════════════════════════════════
   features/Theme.js — theme engine (Festival/Midnight/Ocean/Sunset)
   Switches CSS variables via body[data-theme], persists choice,
   dispatches 'themechange' event for canvas FX re-tint.
   ═════════════════════════════════════════════════════════════ */
import { THEMES, DEFAULT_THEME, STORAGE_KEYS } from "../config/constants.js";

export class Theme {
  constructor() {
    this.current = this.#load();
  }
  #load() {
    try {
      const t = localStorage.getItem(STORAGE_KEYS.theme);
      return THEMES[t] ? t : DEFAULT_THEME;
    } catch { return DEFAULT_THEME; }
  }
  #save(t) { try { localStorage.setItem(STORAGE_KEYS.theme, t); } catch {} }

  apply(theme = this.current) {
    if (!THEMES[theme]) theme = DEFAULT_THEME;
    this.current = theme;
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",
      theme==="midnight" ? "#0a0f1e" : theme==="ocean" ? "#0a2a3a" : theme==="sunset" ? "#3a0f1e" : "#2a0a3a");
    this.#save(theme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  cycle() {
    const keys = Object.keys(THEMES);
    const idx = keys.indexOf(this.current);
    const next = keys[(idx+1)%keys.length];
    this.apply(next);
    return next;
  }

  getMeta() { return THEMES[this.current]; }
}

export const theme = new Theme();
