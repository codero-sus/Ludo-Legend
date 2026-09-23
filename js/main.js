/* ═════════════════════════════════════════════════════════════
   main.js — application entry point. Wires every module together:
   BoardRenderer → TokenRenderer → Dice → TurnManager → HUD → …
   + perf: passive listeners, idle prewarm, reduced-motion guard
   ═════════════════════════════════════════════════════════════ */
import { BoardRenderer } from "./board/BoardRenderer.js";
import { TokenRenderer } from "./board/TokenRenderer.js";
import { TurnManager } from "./core/TurnManager.js";
import { Dice } from "./features/Dice.js";
import { AudioFX } from "./features/AudioFX.js";
import { Storage } from "./features/Storage.js";
import { HUD } from "./ui/HUD.js";
import { SetupScreen } from "./ui/SetupScreen.js";
import { Modals } from "./ui/Modals.js";
import { Toasts } from "./ui/Toasts.js";
import { Effects } from "./ui/Effects.js";
import { $ } from "./core/utils.js";
import { onIdle, prefersReducedMotion } from "./core/perf.js";

function boot() {
  // ── Static board (drawn once, cached) ──────────────────────
  const boardSvg = $("#boardSvg");
  const boardRenderer = new BoardRenderer(boardSvg);
  boardRenderer.render();

  // Prewarm: decode fonts idle, not blocking first paint
  onIdle(() => {
    if (document.fonts?.ready) document.fonts.ready.then(()=> boardRenderer.render());
  });

  // ── Feature modules ────────────────────────────────────────
  const audio = new AudioFX();
  const dice = new Dice($("#diceScene"), $("#diceCube"), $("#rollBtn"));
  const tokens = new TokenRenderer($("#tokenLayer"));
  const hud = new HUD({
    turnDot: $("#turnDot"),
    turnText: $("#turnText"),
    cards: $("#playerCards"),
    log: $("#gameLog"),
    hint: $("#rollHint"),
    lastRoll: $("#lastRollBadge")
  });
  const toasts = new Toasts($("#toastBox"));
  const effects = new Effects($("#confettiCanvas"));
  const modals = new Modals(
    {
      rulesOverlay: $("#rulesOverlay"),
      winnerOverlay: $("#winnerOverlay"),
      winnerTitle: $("#winnerTitle"),
      winnerSub: $("#winnerSub"),
      standings: $("#standingsList"),
      continueBtn: $("#continueBtn"),
      winnerNewBtn: $("#winnerNewBtn")
    },
    hud
  );

  // ── Game engine ────────────────────────────────────────────
  const game = new TurnManager({ dice, tokens, hud, toasts, audio, effects, modals, storage: Storage });
  dice.onRollRequest = () => game.requestRoll();

  // ── Setup screen ───────────────────────────────────────────
  const setup = new SetupScreen({
    overlay: $("#setupOverlay"),
    rows: $("#setupRows"),
    countSeg: $("#playerCountSeg"),
    rulesBox: $("#rulesToggles"),
    startBtn: $("#startGameBtn"),
    quickBots: $("#quickBots"),
    quickHumans: $("#quickHumans"),
    quickDemo: $("#quickDemo")
  });
  setup.onStart = (config) => {
    audio.ensure();
    audio.click();
    Storage.clearSave();
    hud.clearLog();
    dice.setEnabled(false);
    $("#winnerOverlay").classList.remove("show");
    game.newGame(config);
    syncResume();
    // little haptic if available
    if (navigator.vibrate) navigator.vibrate(18);
  };
  game.onMatchEnd = () => {
    audio.click();
    dice.setEnabled(false);
    setup.show();
    syncResume();
  };

  // ── Header / panel buttons (passive where possible) ───────
  const soundBtn = $("#soundBtn");
  const syncSoundBtn = () => { soundBtn.textContent = audio.enabled ? "🔊" : "🔇"; };
  syncSoundBtn();
  soundBtn.addEventListener("click", () => {
    audio.ensure();
    audio.toggle();
    syncSoundBtn();
    audio.click();
  }, { passive: true });

  $("#rulesBtn").addEventListener("click", () => { audio.click(); modals.openRules(); }, { passive: true });
  $("#newGameBtn").addEventListener("click", () => { audio.click(); dice.setEnabled(false); setup.show(); }, { passive: true });
  $("#restartBtn").addEventListener("click", () => {
    if (!game.state) return;
    audio.click();
    Storage.clearSave();
    hud.clearLog();
    $("#winnerOverlay").classList.remove("show");
    game.restart();
    toasts.show("🔄 Match restarted!", "gold");
    if (navigator.vibrate) navigator.vibrate(12);
  }, { passive: true });
  $("#quitBtn").addEventListener("click", () => {
    audio.click();
    game.stop();
    dice.setEnabled(false);
    $("#winnerOverlay").classList.remove("show");
    setup.show();
    syncResume();
  }, { passive: true });
  $("#clearLogBtn").addEventListener("click", () => hud.clearLog(), { passive: true });

  // Resume button
  const resumeBtn = $("#resumeBtn");
  const syncResume = () => resumeBtn.classList.toggle("hidden", !Storage.hasSave());
  resumeBtn.addEventListener("click", () => {
    const saved = Storage.loadGame();
    if (!saved) {
      toasts.show("No saved game found.", "gold");
      syncResume();
      return;
    }
    audio.ensure();
    audio.click();
    setup.hide();
    game.resumeGame(saved);
    syncResume();
  }, { passive: true });

  // ── Keyboard shortcuts (throttled) ─────────────────────────
  let lastKey = 0;
  window.addEventListener("keydown", (ev) => {
    if (ev.target.matches("input")) {
      if (ev.key === "Escape") ev.target.blur();
      return;
    }
    const now = performance.now();
    if (now - lastKey < 180) return;
    lastKey = now;
    switch (ev.code) {
      case "Space":
        ev.preventDefault();
        game.requestRoll();
        break;
      case "KeyR":
        modals.toggleRules();
        break;
      case "KeyM":
        audio.ensure();
        audio.toggle();
        syncSoundBtn();
        break;
      case "KeyN":
        dice.setEnabled(false);
        setup.show();
        break;
      case "Escape":
        modals.closeRules();
        break;
    }
  });

  // ── Pause animations when tab hidden (save GPU) ───────────
  document.addEventListener("visibilitychange", () => {
    document.body.style.animationPlayState = document.hidden ? "paused" : "";
  });

  // ── Go! ────────────────────────────────────────────────────
  syncResume();
  hud.banner("Welcome to Ludo Legend!");
  hud.hint("Set up your players to begin…");
  setup.show();

  // Subtle entrance for layout
  if (!prefersReducedMotion()) {
    const layout = $("#layout");
    layout.style.opacity = "0";
    layout.style.transform = "translateY(8px)";
    requestAnimationFrame(() => {
      layout.style.transition = "opacity 420ms var(--ease-out), transform 420ms var(--ease-out)";
      layout.style.opacity = "1";
      layout.style.transform = "none";
      setTimeout(()=> layout.style.transition="", 500);
    });
  }
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
