/* ═════════════════════════════════════════════════════════════
   core/TurnManager.js — the game engine. Owns turn flow:
   roll → choose token → animate → capture → bonus/extra turns → win.
   UI access goes through the injected collaborators (dice, tokens,
   hud, toasts, audio, effects, modals, storage).
   ═════════════════════════════════════════════════════════════ */
import { GameState } from "./GameState.js";
import { getMovableTokens, targetForRoll, findCaptures } from "./Rules.js";
import { chooseToken } from "../features/AI.js";
import { YARD, FINISHED, DELAYS, COLOR_META } from "../config/constants.js";
import { wait } from "./utils.js";

export class TurnManager {
  /**
   * @param {object} deps - { dice, tokens, hud, toasts, audio, effects, modals, storage }
   */
  constructor(deps) {
    this.d = deps;
    this.state = null;
    this.onMatchEnd = null; // callback when user exits to setup
  }

  get current() { return this.state?.currentPlayer(); }
  get isHumanTurn() {
    return !!this.state && this.state.phase === "moving" && this.current.type === "human";
  }

  // ── Match lifecycle ────────────────────────────────────────
  newGame(config) {
    this._gen++;
    this.state = new GameState(config);
    this.#setupBoard();
    this.d.hud.log(`✨ New match: ${this.state.players.map((p) => p.name).join(", ")}`, "sys");
    this.#beginTurn(this._gen);
  }

  resumeGame(savedState) {
    this._gen++;
    this.state = savedState;
    this.state.phase = "rolling";
    this.state.movable = [];
    this.#setupBoard();
    this.d.hud.log("▶ Saved match resumed. Good luck!", "sys");
    this.#beginTurn(this._gen);
  }

  /** Halt all in-flight async turn flows (e.g. user quit to setup). */
  stop() {
    this._gen++;
    this.state = null;
  }

  /** Rebuild token pawns + HUD for the current state. */
  #setupBoard() {
    this.d.tokens.build(this.state.players);
    this.d.tokens.update(this.state);
    this.d.hud.renderPlayers(this.state);
    this.d.hud.setLastRoll(this.state.lastRoll);
  }

  // ── Turn flow ──────────────────────────────────────────────
  async #beginTurn() {
    const s = this.state;
    if (!s || s.phase === "gameover") return;

    // Skip finished players
    let guard = 0;
    while (this.current.rank !== null && guard++ < 8) this.#advanceIndex();

    s.phase = "rolling";
    s.movable = [];
    this.d.tokens.clearMovable();
    this.d.tokens.spotlight(this.current.color);
    this.d.hud.update(this.state, { status: this.current.type === "bot" ? "🤖 thinking…" : "Your move!" });
    this.d.hud.banner(`${COLOR_META[this.current.color].avatar} ${this.current.name}'s turn`, this.current.color);
    this.d.storage.saveGame(s);

    if (this.current.type === "bot") {
      this.d.dice.setEnabled(false, "🤖 BOT");
      this.d.hud.hint(`${this.current.name} is thinking…`);
      await wait(DELAYS.botRoll);
      if (s.phase !== "rolling") return; // match restarted mid-wait
      this.requestRoll();
    } else {
      this.d.audio.turn();
      this.d.dice.setEnabled(true, `🎲 ROLL <kbd>Space</kbd>`);
      this.d.hud.hint(`${this.current.name}, tap the dice to roll!`);
    }
  }

  /** Called when the human/bot presses roll (dice, button, or Space). */
  async requestRoll() {
    const s = this.state;
    if (!s || s.phase !== "rolling") return;
    s.phase = "animating"; // lock during dice animation
    const player = this.current;
    this.d.dice.setEnabled(false);
    this.d.hud.hint(`${player.name} rolled…`);
    this.d.audio.dice();

    const roll = await this.d.dice.roll();
    if (gen !== this._gen) return;
    s.lastRoll = roll;
    this.d.hud.setLastRoll(roll);
    if (roll === 6) {
      player.stats.sixes++;
      this.d.audio.six();
      s.consecutiveSixes++;
    } else {
      s.consecutiveSixes = 0;
    }

    // ── Three consecutive sixes → forfeit ──
    if (roll === 6 && s.consecutiveSixes >= 3 && s.rules.threeSixesForfeit) {
      s.consecutiveSixes = 0;
      this.d.audio.badLuck();
      this.d.hud.log(`🚫 ${player.name} rolled three 6s in a row — turn skipped!`, player.color);
      this.d.toasts.show(`🚫 Three 6s! ${player.name}'s turn is skipped.`, "gold");
      this.d.hud.update(s, { status: "3 sixes — skipped!" });
      await wait(DELAYS.noMovePass);
      return this.#endTurn(false);
    }

    // ── Find legal moves ──
    const movable = getMovableTokens(s, s.turnIndex, roll);
    s.movable = movable;

    if (movable.length === 0) {
      this.d.audio.badLuck();
      this.d.hud.log(`🎲 ${player.name} rolled ${roll} — no possible move.`, player.color);
      this.d.toasts.show(`🎲 ${roll} — no moves for ${player.name}.`, player.color);
      this.d.hud.update(s, { status: `Rolled ${roll} — stuck!` });
      await wait(DELAYS.noMovePass);
      return this.#endTurn(roll === 6); // a 6 with no moves still re-rolls
    }

    s.phase = "moving";
    this.d.hud.update(s, { status: `Rolled ${roll} — pick a token!` });
    this.d.hud.hint(
      player.type === "bot"
        ? `${player.name} rolled ${roll}, choosing…`
        : `You rolled ${roll} — tap a glowing ${COLOR_META[player.color].avatar} token!`
    );
    this.d.tokens.setMovable(player, movable, (idx) => this.chooseToken(idx));

    if (player.type === "bot") {
      await wait(DELAYS.botMove);
      if (s.phase !== "moving") return;
      this.chooseToken(chooseToken(s, s.turnIndex, roll, movable));
    }
  }

  /** A token was picked (human tap or bot decision). */
  async chooseToken(tokenIdx) {
    const s = this.state;
    if (!s || s.phase !== "moving" || !s.movable.includes(tokenIdx)) return;
    s.phase = "animating";
    const player = this.current;
    const roll = s.lastRoll;
    const target = targetForRoll(s, player, tokenIdx, roll);
    if (target === null) { s.phase = "moving"; return; }

    this.d.tokens.clearMovable();
    this.d.dice.setEnabled(false);
    this.d.hud.update(s, { status: "Moving…" });

    // ── Animate travel ──
    const token = player.tokens[tokenIdx];
    if (token.pos === YARD) {
      this.d.hud.log(`🚀 ${player.name} brings a token out! (rolled 6)`, player.color);
      token.pos = 0;
      this.d.audio.hop(0);
      this.d.tokens.update(s);
      this.d.tokens.hop(player.color, tokenIdx);
      await wait(DELAYS.step + 120);
      if (gen !== this._gen) return;
    } else {
      const from = token.pos;
      for (let p = from + 1; p <= target; p++) {
        if (gen !== this._gen) return;
        token.pos = p;
        this.d.audio.hop(p - from);
        this.d.tokens.update(s);
        this.d.tokens.hop(player.color, tokenIdx);
        await wait(DELAYS.step);
      }
      if (gen !== this._gen) return;
    }

    // ── Resolve landing ──
    let captured = 0;
    let reachedHome = false;

    if (target === FINISHED) {
      player.stats.homes++;
      reachedHome = true;
      this.d.audio.home();
      this.d.hud.log(`🏠 ${player.name} brings a token HOME! (${this.state.finishedCount(player)}/4)`, player.color);
      this.d.toasts.show(`🏠 ${player.name} scores a token home!`, player.color);
    } else {
      const victims = findCaptures(s, s.turnIndex, player.color, target);
      if (victims.length > 0) {
        await wait(DELAYS.capturePause);
        this.d.audio.capture();
        for (const v of victims) {
          const victim = s.players[v.playerIdx];
          victim.tokens[v.tokenIdx].pos = YARD;
          this.d.tokens.flashCapture(victim.color, v.tokenIdx);
          this.d.hud.log(`⚔️ ${player.name} captures ${victim.name}'s token!`, player.color);
        }
        captured = victims.length;
        player.stats.captures += captured;
        this.d.toasts.show(`⚔️ ${player.name} captures ${captured} token${captured > 1 ? "s" : ""}! Bonus roll!`, player.color);
        this.d.tokens.update(s);
        await wait(500);
      } else {
        this.d.hud.log(
          `➜ ${player.name} moves ${roll} step${roll > 1 ? "s" : ""} (rolled ${roll}).`,
          player.color
        );
      }
    }

    // ── Player finished all 4? ──
    if (this.state.hasFinished(player)) {
      player.rank = this.state.nextRank++;
      this.d.hud.update(s, { status: `Finished #${player.rank}!` });
      this.d.hud.log(`🏆 ${player.name} finishes #${player.rank}!`, player.color);
      await wait(DELAYS.winPause);
      return this.#onPlayerFinished(player);
    }

    // ── Bonus / extra turn? ──
    const extra =
      roll === 6 ||
      (captured > 0 && s.rules.bonusOnCapture) ||
      (reachedHome && s.rules.bonusOnHome);
    if (extra && roll !== 6) {
      this.d.toasts.show(`🎁 Bonus roll for ${player.name}!`, "gold");
    }
    this.#endTurn(extra);
  }

  #onPlayerFinished(player) {
    const s = this.state;
    this.d.audio.win();
    this.d.effects.confettiBurst(4500);
    this.d.storage.saveGame(s);

    const remaining = s.racers();
    if (remaining.length <= 1) {
      // Match fully over — award last place
      if (remaining.length === 1) {
        remaining[0].rank = s.nextRank++;
      }
      s.phase = "gameover";
      this.d.storage.clearSave();
      this.d.hud.update(s, { status: "Match over!" });
      this.d.hud.banner(`🏆 ${player.name} wins the match!`, player.color);
      this.d.modals.showWinner({
        player,
        state: s,
        isFinal: true,
        onNewGame: () => this.onMatchEnd?.()
      });
    } else {
      this.d.hud.banner(`🏆 ${player.name} finished #${player.rank}!`, player.color);
      this.d.modals.showWinner({
        player,
        state: s,
        isFinal: false,
        onContinue: () => this.#endTurn(false),
        onNewGame: () => this.onMatchEnd?.()
      });
    }
  }

  #endTurn(keepTurn) {
    const s = this.state;
    if (!s || s.phase === "gameover") return;
    if (!keepTurn) {
      this.#advanceIndex();
      s.turnCount++;
      s.consecutiveSixes = 0;
    }
    this.d.hud.update(s, {});
    setTimeout(() => this.#beginTurn(), DELAYS.turnSwap);
  }

  #advanceIndex() {
    const s = this.state;
    s.turnIndex = (s.turnIndex + 1) % s.players.length;
  }

  /** Restart the same match configuration. */
  restart() {
    if (!this.state) return;
    const config = {
      players: this.state.players.map(({ color, name, type }) => ({ color, name, type })),
      rules: { ...this.state.rules }
    };
    this.newGame(config);
  }
}
