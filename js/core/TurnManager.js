/* ═════════════════════════════════════════════════════════════
   core/TurnManager.js — game engine with undo, hints, stats, themes
   • Gen-guarded async flow
   • RAF-batched HUD
   • Debounced persistence
   • Undo stack (3 deep), dice history, streaks
   ═════════════════════════════════════════════════════════════ */
import { GameState } from "./GameState.js";
import { getMovableTokens, targetForRoll, findCaptures } from "./Rules.js";
import { chooseToken } from "../features/AI.js";
import { hintFor } from "../features/Hints.js";
import { YARD, FINISHED, DELAYS, COLOR_META } from "../config/constants.js";
import { wait } from "./utils.js";
import { debounce, rafBatch, prefersReducedMotion } from "./perf.js";
import { stats } from "../features/Stats.js";

export class TurnManager {
  constructor(deps) {
    this.d = deps;
    this.state = null;
    this._gen = 0;
    this.onMatchEnd = null;
    this._saveDebounced = debounce((s) => { try { this.d.storage.saveGame(s); } catch {} }, 180);
    this._saveImmediate = (s) => { try { this.d.storage.saveGame(s); } catch {} };
    this._undoStack = [];
    this._captureStreak = 0;
  }

  get current() { return this.state?.currentPlayer(); }
  get isHumanTurn() { return !!this.state && this.state.phase === "moving" && this.current.type === "human"; }

  newGame(config) {
    this._gen++; const gen=this._gen;
    this.state = new GameState(config);
    this._undoStack = [];
    this._captureStreak = 0;
    this.#pushUndo();
    this.#setupBoard();
    stats.recordGameStart(); stats.startSession();
    this.d.hud.log(`✨ New match: ${this.state.players.map(p=>p.name).join(", ")}`, "sys");
    this.d.hud.renderDiceHistory(this.state);
    this.#beginTurn(gen);
  }
  resumeGame(savedState) {
    this._gen++; const gen=this._gen;
    this.state = savedState; this.state.phase="rolling"; this.state.movable=[];
    this._undoStack = [];
    this.#setupBoard();
    this.d.hud.log("▶ Saved match resumed. Good luck!", "sys");
    this.d.hud.renderDiceHistory(this.state);
    this.#beginTurn(gen);
  }
  stop() { this._gen++; this.state=null; this.d.tokens.clearMovable?.(); this.d.tokens.clearHint?.(); this.d.tokens.clearPathPreview?.(); this.d.dice.setEnabled(false); stats.endSession(); }

  #setupBoard() {
    this.d.tokens.build(this.state.players);
    rafBatch(()=>{ this.d.tokens.update(this.state); this.d.hud.renderPlayers(this.state); this.d.hud.setLastRoll(this.state.lastRoll); });
  }

  #pushUndo() {
    if (!this.state) return;
    try {
      const snap = this.state.clone();
      this._undoStack.push(snap);
      if (this._undoStack.length > 4) this._undoStack.shift();
    } catch {}
  }

  canUndo() { return this._undoStack.length >= 2 && this.state?.phase !== "animating"; }
  undo() {
    if (!this.canUndo()) { this.d.toasts.show("Nothing to undo yet!", "gold"); return false; }
    // pop current, restore previous
    this._undoStack.pop(); // current
    const prev = this._undoStack[this._undoStack.length-1];
    if (!prev) return false;
    this._gen++;
    const gen=this._gen;
    this.state = prev.clone();
    this.state.phase="rolling"; this.state.movable=[];
    this.d.tokens.clearMovable(); this.d.tokens.clearHint?.(); this.d.tokens.clearPathPreview?.();
    this.d.tokens.update(this.state);
    this.d.hud.renderPlayers(this.state);
    this.d.hud.renderDiceHistory(this.state);
    this.d.hud.banner(`↩️ Undo — ${this.current.name}'s turn`, this.current.color);
    this.d.hud.hint("Move undone. Roll again or pick a token.");
    this.d.toasts.show("↩️ Last move undone", "gold");
    this._saveImmediate(this.state);
    this.#beginTurn(gen);
    return true;
  }

  hint() {
    const s=this.state; if(!s || s.phase!=="moving") { this.d.toasts.show("Roll first, then ask for a hint! 💡","gold"); return; }
    const movable=s.movable; const roll=s.lastRoll;
    const h=hintFor(s, s.turnIndex, roll, movable);
    if(!h) return;
    this.d.tokens.showHint?.(s.players[s.turnIndex].color, h.tokenIdx);
    this.d.toasts.show(`💡 ${h.reason} — token ${h.tokenIdx+1}`, s.players[s.turnIndex].color, 2600);
    this.d.hud.hint(`Hint: ${h.reason}`);
    if(navigator.vibrate) navigator.vibrate(10);
  }

  async #beginTurn(gen) {
    if(gen!==this._gen) return;
    const s=this.state; if(!s || s.phase==="gameover") return;
    let guard=0; while(this.current && this.current.rank!==null && guard++<8) this.#advanceIndex();
    s.phase="rolling"; s.movable=[];
    this.d.tokens.clearMovable(); this.d.tokens.clearHint?.(); this.d.tokens.clearPathPreview?.();
    this.d.tokens.spotlight(this.current.color);
    rafBatch(()=>{
      this.d.hud.update(this.state, { status: this.current.type==="bot" ? "🤖 thinking…" : "Your move!" });
      this.d.hud.banner(`${COLOR_META[this.current.color].avatar} ${this.current.name}'s turn`, this.current.color);
      this.d.hud.setHintActions?.(this.canUndo(), s.phase==="moving");
    });
    this._saveImmediate(s);
    if(this.current.type==="bot") {
      this.d.dice.setEnabled(false, "🤖 BOT");
      this.d.hud.hint(`${this.current.name} is thinking…`);
      await wait(DELAYS.botRoll); if(gen!==this._gen) return; if(s.phase!=="rolling") return;
      this.requestRoll(gen);
    } else {
      this.d.audio.turn();
      this.d.dice.setEnabled(true, `🎲 ROLL <kbd>Space</kbd>`);
      this.d.hud.hint(`${this.current.name}, tap the dice to roll!`);
    }
  }

  async requestRoll(gen=this._gen) {
    const s=this.state; if(!s || s.phase!=="rolling") return;
    const myGen=gen; if(myGen!==this._gen) return;
    s.phase="animating";
    const player=this.current;
    this.d.dice.setEnabled(false);
    this.d.hud.hint(`${player.name} rolled…`);
    this.d.audio.dice();
    if(!prefersReducedMotion() && Math.random()<0.35) {
      document.body.classList.remove("shake-screen"); void document.body.offsetWidth;
      document.body.classList.add("shake-screen"); setTimeout(()=>document.body.classList.remove("shake-screen"),500);
    }
    const roll=await this.d.dice.roll(); if(myGen!==this._gen) return;
    s.lastRoll=roll; s.pushDiceHistory(roll, player.color);
    this.d.hud.setLastRoll(roll); this.d.hud.renderDiceHistory(s);
    this.d.effects?.diceBurst?.(player.color, roll);
    if(roll===6){ player.stats.sixes++; stats.recordSix(); this.d.audio.six(); s.consecutiveSixes++; this.d.effects?.sixPulse?.(player.color); this.d.toasts.show(`🎉 SIX! ${player.name} gets another go!`, player.color, 1800); } else s.consecutiveSixes=0;
    if(roll===6 && s.consecutiveSixes>=3 && s.rules.threeSixesForfeit){
      s.consecutiveSixes=0; this.d.audio.badLuck();
      this.d.hud.log(`🚫 ${player.name} rolled three 6s — turn skipped!`, player.color);
      this.d.toasts.show(`🚫 Three 6s! ${player.name}'s turn is skipped.`, "gold");
      rafBatch(()=>this.d.hud.update(s,{status:"3 sixes — skipped!"}));
      await wait(DELAYS.noMovePass); if(myGen!==this._gen) return;
      return this.#endTurn(false, myGen);
    }
    const movable=getMovableTokens(s,s.turnIndex,roll); s.movable=movable;
    if(movable.length===0){
      this.d.audio.badLuck();
      this.d.hud.log(`🎲 ${player.name} rolled ${roll} — no possible move.`, player.color);
      this.d.toasts.show(`🎲 ${roll} — no moves for ${player.name}.`, player.color, 2000);
      rafBatch(()=>this.d.hud.update(s,{status:`Rolled ${roll} — stuck!`}));
      await wait(DELAYS.noMovePass); if(myGen!==this._gen) return;
      return this.#endTurn(roll===6, myGen);
    }
    s.phase="moving";
    rafBatch(()=>this.d.hud.update(s,{status:`Rolled ${roll} — pick a token!`}));
    this.d.hud.hint(player.type==="bot" ? `${player.name} rolled ${roll}, choosing…` : `You rolled ${roll} — tap a glowing ${COLOR_META[player.color].avatar} token! (H for hint)`);
    this.d.hud.setHintActions?.(this.canUndo(), true);
    if(player.type==="human") this.d.tokens.showPathPreview?.(player.color, movable, s, roll);
    this.d.tokens.setMovable(player, movable, (idx)=>this.chooseToken(idx, myGen));
    if(player.type==="bot"){
      await wait(DELAYS.botMove); if(myGen!==this._gen) return; if(s.phase!=="moving") return;
      const diff = player.difficulty || "medium";
      this.chooseToken(chooseToken(s, s.turnIndex, roll, movable, diff), myGen);
    }
  }

  async chooseToken(tokenIdx, gen=this._gen) {
    const myGen=gen; if(myGen!==this._gen) return;
    const s=this.state; if(!s || s.phase!=="moving" || !s.movable.includes(tokenIdx)) return;
    s.phase="animating";
    const player=this.current; const roll=s.lastRoll;
    const target=targetForRoll(s, player, tokenIdx, roll); if(target===null){ s.phase="moving"; return; }
    this.d.tokens.clearMovable(); this.d.tokens.clearHint?.(); this.d.tokens.clearPathPreview?.();
    this.d.dice.setEnabled(false);
    rafBatch(()=>this.d.hud.update(s,{status:"Moving…"}));
    this.d.hud.setHintActions?.(false,false);
    const token=player.tokens[tokenIdx];
    this.#pushUndo(); // snapshot before move (so undo reverts to before)
    if(token.pos===YARD){
      this.d.hud.log(`🚀 ${player.name} brings a token out! (rolled 6)`, player.color);
      token.pos=0; this.d.audio.hop(0);
      rafBatch(()=>this.d.tokens.update(s)); this.d.tokens.hop(player.color, tokenIdx);
      this.d.effects?.burstOut?.(player.color, tokenIdx, s);
      await wait(DELAYS.step+120); if(myGen!==this._gen) return;
    } else {
      const from=token.pos;
      for(let p=from+1;p<=target;p++){ if(myGen!==this._gen) return; token.pos=p; this.d.audio.hop(p-from); this.d.tokens.trail?.(player.color, tokenIdx, p); this.d.effects?.trailSpark?.(player.color, p, s); rafBatch(()=>this.d.tokens.update(s)); this.d.tokens.hop(player.color, tokenIdx); await wait(DELAYS.step); }
      if(myGen!==this._gen) return;
    }
    let captured=0, reachedHome=false;
    if(target===FINISHED){
      player.stats.homes++; stats.recordHome(); reachedHome=true;
      this.d.audio.home();
      this.d.hud.log(`🏠 ${player.name} brings a token HOME! (${this.state.finishedCount(player)}/4)`, player.color);
      this.d.toasts.show(`🏠 ${player.name} scores a token home!`, player.color);
      this.d.effects?.burstHome?.(player.color, tokenIdx, s); this.d.tokens.sparkle?.(player.color, tokenIdx);
      this._captureStreak=0;
    } else {
      const victims=findCaptures(s,s.turnIndex,player.color,target);
      if(victims.length>0){
        await wait(DELAYS.capturePause); if(myGen!==this._gen) return;
        this.d.audio.capture();
        if(!prefersReducedMotion()){
          document.getElementById("boardWrap")?.classList.remove("shake-screen"); void document.getElementById("boardWrap")?.offsetWidth;
          document.getElementById("boardWrap")?.classList.add("shake-screen"); setTimeout(()=>document.getElementById("boardWrap")?.classList.remove("shake-screen"),500);
        }
        for(const v of victims){
          const victim=s.players[v.playerIdx]; victim.tokens[v.tokenIdx].pos=YARD;
          this.d.tokens.flashCapture(victim.color, v.tokenIdx); this.d.tokens.explode?.(victim.color, v.tokenIdx, s);
          this.d.effects?.burstCapture?.(victim.color, v.tokenIdx, player.color, s);
          this.d.hud.log(`⚔️ ${player.name} captures ${victim.name}'s token!`, player.color);
        }
        captured=victims.length; player.stats.captures+=captured; for(let i=0;i<captured;i++) stats.recordCapture();
        this._captureStreak += captured;
        const streakMsg = this._captureStreak>=2 ? `🔥 Rampage! ${this._captureStreak} captures in a row!` : `⚔️ ${player.name} captures ${captured} token${captured>1?"s":""}! Bonus roll!`;
        this.d.toasts.show(streakMsg, this._captureStreak>=2 ? "streak" : player.color);
        if(this._captureStreak>=2) this.d.effects?.fireworks?.(player.color, 1200);
        rafBatch(()=>this.d.tokens.update(s)); await wait(500); if(myGen!==this._gen) return;
      } else {
        this.d.hud.log(`➜ ${player.name} moves ${roll} step${roll>1?"s":""} (rolled ${roll}).`, player.color);
        this._captureStreak=0;
      }
    }
    if(captured || reachedHome) this._saveImmediate(s); else this._saveDebounced(s);
    if(this.state.hasFinished(player)){
      player.rank=this.state.nextRank++; rafBatch(()=>this.d.hud.update(s,{status:`Finished #${player.rank}!`})); this.d.hud.log(`🏆 ${player.name} finishes #${player.rank}!`, player.color);
      stats.recordWin(player);
      await wait(DELAYS.winPause); if(myGen!==this._gen) return;
      return this.#onPlayerFinished(player, myGen);
    }
    const extra= roll===6 || (captured>0 && s.rules.bonusOnCapture) || (reachedHome && s.rules.bonusOnHome);
    if(extra){ if(roll!==6) this.d.toasts.show(`🎁 Bonus roll for ${player.name}!`, "gold", 2000); if(extra && !prefersReducedMotion()) this.d.effects?.bonusRing?.(player.color); }
    else this._captureStreak=0;
    this.#endTurn(extra, myGen);
  }

  #onPlayerFinished(player, gen){
    if(gen!==this._gen) return;
    const s=this.state; this.d.audio.win(); this.d.effects.confettiBurst(4500); this.d.effects.fireworks?.(player.color, 3500); this._saveImmediate(s);
    stats.flush();
    const remaining=s.racers();
    if(remaining.length<=1){
      if(remaining.length===1) remaining[0].rank=s.nextRank++;
      s.phase="gameover"; this.d.storage.clearSave(); stats.endSession();
      rafBatch(()=>this.d.hud.update(s,{status:"Match over!"}));
      this.d.hud.banner(`🏆 ${player.name} wins the match!`, player.color);
      this.d.modals.showWinner({player, state:s, isFinal:true, onNewGame:()=>this.onMatchEnd?.()});
    } else {
      this.d.hud.banner(`🏆 ${player.name} finished #${player.rank}!`, player.color);
      this.d.modals.showWinner({player, state:s, isFinal:false, onContinue:()=>this.#endTurn(false,gen), onNewGame:()=>this.onMatchEnd?.()});
    }
  }

  #endTurn(keepTurn, gen=this._gen){
    if(gen!==this._gen) return;
    const s=this.state; if(!s || s.phase==="gameover") return;
    if(!keepTurn){ this.#advanceIndex(); s.turnCount++; s.consecutiveSixes=0; }
    rafBatch(()=>this.d.hud.update(s,{}));
    setTimeout(()=>{ if(gen===this._gen) this.#beginTurn(gen); }, DELAYS.turnSwap);
  }
  #advanceIndex(){ const s=this.state; s.turnIndex=(s.turnIndex+1)%s.players.length; }
  restart(){ if(!this.state) return; const config={ players:this.state.players.map(({color,name,type,difficulty})=>({color,name,type,difficulty})), rules:{...this.state.rules}}; this.newGame(config); }
}
