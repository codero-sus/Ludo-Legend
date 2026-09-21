/* ═════════════════════════════════════════════════════════════
   main.js — application entry point. Wires every module together:
   BoardRenderer → TokenRenderer → Dice → TurnManager → HUD → …
   ═════════════════════════════════════════════════════════════ */
import { BoardRenderer } from "./board/BoardRenderer.js";
import { TokenRenderer } from "./board/TokenRenderer.js";
import { TurnManager } from "./core/TurnManager.js";
import { Dice } from "./features/Dice.js";
import { AI } from "./features/AI.js"; // (side-effect free; keeps bot logic bundled)
import { AudioFX } from "./features/AudioFX.js";
import { Storage } from "./features/Storage.js";
import { HUD } from "./ui/HUD.js";
import { SetupScreen } from "./ui/SetupScreen.js";
import { Modals } from "./ui/Modals.js";
import { Toasts } from "./ui/Toasts.js";
import { Effects } from "./ui/Effects.js";
import { $ } from "./core/utils.js";

function boot() {
  // ── Static board (drawn once) ──────────────────────────────
  new BoardRenderer($("#boardSvg")).render();

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
  };
  game.onMatchEnd = () => {
    audio.click();
    dice.setEnabled(false);
    setup.show();
  };

  // ── Header / panel buttons ─────────────────────────────────
  const soundBtn = $("#soundBtn");
  const syncSoundBtn = () => { soundBtn.textContent = audio.enabled ? "🔊" : "🔇"; };
  syncSoundBtn();
  soundBtn.addEventListener("click", () => {
    audio.ensure();
    audio.toggle();
    syncSoundBtn();
    audio.click();
  });

  $("#rulesBtn").addEventListener("click", () => { audio.click(); modals.openRules(); });
  $("#newGameBtn").addEventListener("click", () => { audio.click(); dice.setEnabled(false); setup.show(); });
  $("#restartBtn").addEventListener("click", () => {
    if (!game.state) return;
    audio.click();
    Storage.clearSave();
    hud.clearLog();
    game.restart();
    toasts.show("🔄 Match restarted!", "gold");
  });
  $("#quitBtn").addEventListener("click", () => {
    audio.click();
    game.stop();
    dice.setEnabled(false);
    setup.show();
  });
  $("#clearLogBtn").addEventListener("click", () => hud.clearLog());

  // Resume button (only when a save exists)
  const resumeBtn = $("#resumeBtn");
  const syncResume = () => resumeBtn.classList.toggle("hidden", !Storage.hasSave() || !!game.state);
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
  });

  // ── Keyboard shortcuts ─────────────────────────────────────
  window.addEventListener("keydown", (ev) => {
    if (ev.target.matches("input")) {
      if (ev.key === "Escape") ev.target.blur();
      return;
    }
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

  // ── Go! ────────────────────────────────────────────────────
  syncResume();
  hud.banner("Welcome to Ludo Legend!");
  hud.hint("Set up your players to begin…");
  setup.show();
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
