/* ═════════════════════════════════════════════════════════════
   features/Storage.js — localStorage persistence (save/resume/config).
   ═════════════════════════════════════════════════════════════ */
import { STORAGE_KEYS } from "../config/constants.js";
import { GameState } from "../core/GameState.js";

export const Storage = {
  saveGame(state) {
    try {
      if (state.phase === "gameover") return;
      localStorage.setItem(STORAGE_KEYS.save, state.serialize());
    } catch { /* quota / privacy mode — ignore */ }
  },

  loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.save);
      if (!raw) return null;
      return GameState.deserialize(raw);
    } catch {
      return null;
    }
  },

  hasSave() {
    try {
      return !!localStorage.getItem(STORAGE_KEYS.save);
    } catch {
      return false;
    }
  },

  clearSave() {
    try { localStorage.removeItem(STORAGE_KEYS.save); } catch { /* ignore */ }
  },

  saveConfig(config) {
    try { localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config)); } catch { /* ignore */ }
  },

  loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.config);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
