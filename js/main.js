/* ═════════════════════════════════════════════════════════════
   main.js — Bharat Games hub + Ludo Legend wiring
   Keeps Ludo modular, lazy-loads Snake/Carrom/Chess via GameHub
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
import { theme } from "./features/Theme.js";
import { stats } from "./features/Stats.js";
import { THEMES } from "./config/constants.js";
import { GameHub } from "./hub/GameHub.js";
import { $ } from "./core/utils.js";
import { onIdle, prefersReducedMotion } from "./core/perf.js";

function bootLudo({ audio, dice, tokens, hud, toasts, effects, modals }) {
  const boardRenderer = new BoardRenderer($("#boardSvg"));
  boardRenderer.render();
  onIdle(() => { if(document.fonts?.ready) document.fonts.ready.then(()=> boardRenderer.render()); });

  const game = new TurnManager({ dice, tokens, hud, toasts, audio, effects, modals, storage: Storage });
  dice.onRollRequest = () => game.requestRoll();

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
    audio.ensure(); audio.click();
    Storage.clearSave(); hud.clearLog();
    dice.setEnabled(false);
    $("#winnerOverlay").classList.remove("show");
    game.newGame(config);
    syncResume(); hud.renderStats();
    if(navigator.vibrate) navigator.vibrate(18);
  };
  game.onMatchEnd = () => { audio.click(); dice.setEnabled(false); setup.show(); syncResume(); hud.renderStats(); };

  const soundBtn=$("#soundBtn");
  const syncSoundBtn=()=>{ soundBtn.textContent=audio.enabled?"🔊":"🔇"; }; syncSoundBtn();
  soundBtn.addEventListener("click",()=>{ audio.ensure(); audio.toggle(); syncSoundBtn(); audio.click(); }, {passive:true});

  const themeBtn=$("#themeBtn");
  const syncThemeBtn=()=>{
    const m=THEMES[theme.current];
    themeBtn.textContent=m.icon; themeBtn.title=`Theme: ${m.label} (T)`;
  }; syncThemeBtn();
  themeBtn.addEventListener("click",()=>{
    audio.click();
    const t=theme.cycle(); syncThemeBtn();
    toasts.show(`${THEMES[t].icon} ${THEMES[t].label} theme`, "gold", 1600);
    boardRenderer.render();
    // also refresh other games if init'd
    document.getElementById("snakeGame")?.dispatchEvent(new CustomEvent("themechange"));
  }, {passive:true});

  // expose for hub
  window._ludo = { game, setup, boardRenderer, syncThemeBtn };

  $("#rulesBtn").addEventListener("click",()=>{
    audio.click();
    // show correct rules per hub
    const hub = window._hub;
    const cur = hub?.current || "ludo";
    const names={ludo:"Ludo", snake:"Moksha Patam", carrom:"Carrom", chess:"Bharat Chess", tiger:"Aadu Puli Attam", mancala:"Pallanguzhi", tambola:"Tambola", chowka:"Chowka Bhara"};
    document.getElementById("rulesGameName").textContent = names[cur] || "Ludo";
    ["Ludo","Snake","Carrom","Chess","Tiger","Mancala","Tambola","Chowka"].forEach(name=>{
      const el=document.getElementById(`rulesBody${name}`);
      if(el) el.style.display = name.toLowerCase()===cur ? "block" : "none";
    });
    modals.openRules();
  }, {passive:true});

  $("#newGameBtn").addEventListener("click",()=>{
    const hub=window._hub;
    if(hub && hub.current!=="ludo"){
      hub.showGame("ludo", true);
      setTimeout(()=> setup.show(), 300);
    } else {
      audio.click(); dice.setEnabled(false); setup.show();
    }
  }, {passive:true});

  $("#restartBtn").addEventListener("click",()=>{
    if(!game.state) return; audio.click(); Storage.clearSave(); hud.clearLog();
    $("#winnerOverlay").classList.remove("show"); game.restart();
    toasts.show("🔄 Match restarted!", "gold");
    if(navigator.vibrate) navigator.vibrate(12);
  },{passive:true});
  $("#quitBtn").addEventListener("click",()=>{
    audio.click(); game.stop(); dice.setEnabled(false);
    $("#winnerOverlay").classList.remove("show"); setup.show(); syncResume();
  },{passive:true});
  $("#clearLogBtn").addEventListener("click",()=>hud.clearLog(),{passive:true});

  const hintBtn=$("#hintBtn"), undoBtn=$("#undoBtn");
  hintBtn.addEventListener("click",()=>{ audio.click(); game.hint(); },{passive:true});
  undoBtn.addEventListener("click",()=>{ audio.click(); game.undo(); hud.renderStats(); },{passive:true});

  const resumeBtn=$("#resumeBtn");
  const syncResume=()=> resumeBtn.classList.toggle("hidden", !Storage.hasSave());
  resumeBtn.addEventListener("click",()=>{
    const saved=Storage.loadGame(); if(!saved){ toasts.show("No saved game found.","gold"); syncResume(); return; }
    audio.ensure(); audio.click(); setup.hide(); game.resumeGame(saved); syncResume();
  },{passive:true});

  // Keyboard for Ludo only when ludo active
  let lastKey=0;
  window.addEventListener("keydown",(ev)=>{
    const hub=window._hub; if(hub && hub.current!=="ludo") return;
    if(ev.target.matches("input")){ if(ev.key==="Escape") ev.target.blur(); return; }
    const now=performance.now(); if(now-lastKey<120) return; lastKey=now;
    switch(ev.code){
      case "Space": ev.preventDefault(); game.requestRoll(); break;
      case "KeyH": game.hint(); break;
      case "KeyZ": ev.preventDefault(); game.undo(); break;
      case "KeyT": theme.cycle(); syncThemeBtn(); boardRenderer.render(); break;
      case "Digit1": case "Digit2": case "Digit3": case "Digit4":
        if(game.isHumanTurn){
          const idx=Number(ev.code.slice(5))-1;
          if(game.state.movable.includes(idx)) game.chooseToken(idx);
        }
        break;
      case "KeyR": modals.toggleRules(); break;
      case "KeyM": audio.ensure(); audio.toggle(); syncSoundBtn(); break;
      case "KeyN": dice.setEnabled(false); setup.show(); break;
      case "Escape": modals.closeRules(); break;
    }
  });

  document.addEventListener("visibilitychange",()=>{
    document.body.style.animationPlayState=document.hidden?"paused":"";
    if(document.hidden) stats.endSession(); else stats.startSession();
  });

  const footerStats=$("#footerStats");
  const syncFooter=()=>{
    const s=stats.getSnapshot();
    if(footerStats) footerStats.textContent=`${s.games} games · ${s.captures} captures`;
  };
  setInterval(syncFooter, 2000); syncFooter();

  const boardWrap=$("#boardWrap");
  if(boardWrap && !prefersReducedMotion() && window.matchMedia("(hover:hover)").matches){
    let raf=0;
    boardWrap.addEventListener("mousemove",(e)=>{
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        const r=boardWrap.getBoundingClientRect();
        const x=(e.clientX - r.left)/r.width - 0.5;
        const y=(e.clientY - r.top)/r.height - 0.5;
        boardWrap.style.transform=`perspective(900px) rotateY(${x*4}deg) rotateX(${-y*4}deg)`;
      });
    }, {passive:true});
    boardWrap.addEventListener("mouseleave",()=>{ boardWrap.style.transform=""; }, {passive:true});
  }

  syncResume(); hud.banner("Welcome to Ludo Legend!"); hud.hint("Set up your players to begin… (H for hint, Z to undo)");
  hud.renderStats();
  // show ludo setup initially, but hubOverlay is also show — ludo setup will be behind hub, that's intentional
  setup.show();

  if(!prefersReducedMotion()){
    const layout=$("#layout");
    layout.style.opacity="0"; layout.style.transform="translateY(8px)";
    requestAnimationFrame(()=>{
      layout.style.transition="opacity 420ms var(--ease-out), transform 420ms var(--ease-out)";
      layout.style.opacity="1"; layout.style.transform="none";
      setTimeout(()=>layout.style.transition="",500);
    });
  }

  return { game, setup, boardRenderer };
}

function boot(){
  theme.apply();
  const audio = new AudioFX();
  const dice = new Dice($("#diceScene"), $("#diceCube"), $("#rollBtn"));
  const tokens = new TokenRenderer($("#tokenLayer"));
  const hud = new HUD({
    turnDot: $("#turnDot"), turnText: $("#turnText"),
    cards: $("#playerCards"), log: $("#gameLog"),
    hint: $("#rollHint"), lastRoll: $("#lastRollBadge"),
    diceHistory: $("#diceHistory"), hintBtn: $("#hintBtn"), undoBtn: $("#undoBtn"),
    statsGrid: $("#statsGrid"), streakBadge: $("#streakBadge")
  });
  const toasts = new Toasts($("#toastBox"));
  const effects = new Effects($("#confettiCanvas"));
  const modals = new Modals({
    rulesOverlay: $("#rulesOverlay"), winnerOverlay: $("#winnerOverlay"),
    winnerTitle: $("#winnerTitle"), winnerSub: $("#winnerSub"),
    standings: $("#standingsList"), continueBtn: $("#continueBtn"), winnerNewBtn: $("#winnerNewBtn")
  }, hud);

  const ludo = bootLudo({ audio, dice, tokens, hud, toasts, effects, modals });

  // Hub — after Ludo is ready
  const hub = new GameHub({
    hubOverlay: $("#hubOverlay"),
    hubNav: $("#hubNav"),
    gameSections: {
      ludo: $("#ludoGame"),
      snake: $("#snakeGame"),
      carrom: $("#carromGame"),
      chess: $("#chessGame"),
      tiger: $("#tigerGame"),
      mancala: $("#mancalaGame"),
      tambola: $("#tambolaGame"),
      chowka: $("#chowkaGame")
    },
    triggerBtn: $("#hubBtn")
  });
  window._hub = hub;
  window._ludo = ludo;

  // Global hub shortcut: G to open hub
  window.addEventListener("keydown",(e)=>{
    if(e.target.matches("input")) return;
    if(e.code==="KeyG"){ hub.toggleHub(); }
    if(e.code==="KeyT" && hub.current!=="ludo"){
      // allow theme toggle from any game
      const t=theme.cycle();
      document.getElementById("themeBtn").textContent=THEMES[t].icon;
      ludo.boardRenderer.render();
    }
  });

  if("serviceWorker" in navigator){
    onIdle(()=>{
      const swCode = `self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`;
      const blob=new Blob([swCode],{type:"text/javascript"});
      const url=URL.createObjectURL(blob);
      navigator.serviceWorker.register(url).catch(()=>{});
    });
  }
}

document.readyState==="loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
