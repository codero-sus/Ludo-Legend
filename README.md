# 🎮 Bharat Games — भारत खेल

**Festival arcade of 8 Indian classics:** Ludo Legend, Moksha Patam (Snake & Ladder), Carrom, Bharat Chess (Chaturanga), **Aadu Puli Attam** (Tiger & Goat), **Pallanguzhi** (Mancala), **Tambola** (Housie) & **Chowka Bhara** (Ashta Chamma) — all Indian styled, modular, and playable in the browser. No build, no deps: just open and play.

## ✨ Games

### 🎲 Ludo Legend — लूडो लेजेंड
2–4 players (human + bots), 6 to leave base, safe stars ⭐, captures ⚔️ with bonus rolls, exact home, 3-six forfeit, hint (H) & undo (Z), dice history, lifetime stats, 4 bot difficulties.

### 🐍 Moksha Patam — Snake & Ladder
10×10 boustrophedon board (1→100), Nagas 🐍 slide down, bamboo ladders 🪜 climb up, peacock safe cells, exact 100 Moksha, extra turn on 6, Indian bamboo & rangoli styling.

### 🏹 Carrom — कैरम
Wooden teak board with powder & gold corners, 9 white + 9 black + queen 🔴, striker flick via drag (aim line + power), elastic collisions with friction & wall bounce, corner pockets — first to 9 wins. Touch + mouse.

### ♔ Bharat Chess — Chaturanga
8×8 teak & ivory, Raja/Mantri/Hathi/Oont/Ghoda/Pyada (King/Queen/Rook/Bishop/Knight/Pawn), legal move highlights, check/checkmate/stalemate, castling, promotion, Human-Human / Human-Bot / Bot-Bot, greedy bot.

### 🐯 Aadu Puli Attam — Tiger & Goat
23-point forest board (triangle + grid), 3 🐯 vs 15 🐐, goats place then move 1 step, tigers jump-capture over goats, Goats win by blocking Tigers / Tigers win at 5 captures. You = Goats vs Tiger Bot, toggle to 2P, teak & forest styling.

### 🫘 Pallanguzhi — South Indian Mancala
Tamil wooden board, 7 pits + store per player, 6 tamarind seeds per pit, sow clockwise, land in store = extra turn, land in empty own pit = capture opposite, ends when one side empty — most in store wins. Vs Bot.

### 🎱 Tambola — Housie (Indian Bingo)
1–90 caller, 3×9 ticket (5 numbers/row, col-ranges 1-9…80-90), You vs 3 bots, auto-mark, prizes: Early 5, Top/Middle/Bottom line, Corners, Full House (15). Call / Auto every 1.1s, green board, ivory ticket.

### 🎲 Chowka Bhara — Ashta Chamma
5×5 cross board (teak & ivory), 4 tokens each, 4 cowries 🐚 (0 up=8, 1=1, 2=2, 3=3, 4=4), need 1/8 to enter, safe ⭐ stars, capture sends home, exact centre home, 4 or 8 & captures = extra throw. You vs Bot.

Shared: 🇮🇳 festival theme (rangoli, diyas 🪔, light string, gold, Hindi), 4 themes (Festival/Midnight/Ocean/Sunset) via 🎨, synthesized WebAudio, confetti/fireworks, auto-save/resume, responsive 📱.

## 🚀 Run it

Any static server (ES modules need http):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## 🧩 Modular architecture

```
index.html                  # hub shell: header, 8-tab hub nav/overlay, 8 game sections
css/
  variables.css  themes.css  base.css  board.css  dice.css  panels.css
  modals.css  effects.css  enhancements.css
  hub.css  snake.css  carrom.css  chess.css  tiger.css  mancala.css  tambola.css  chowka.css
  responsive.css
js/
  main.js                   # hub boot + Ludo wiring
  hub/GameHub.js            # lazy game switching, 8 games
  config/constants.js       # colors, rules, difficulty, themes
  core/  GameState.js  Rules.js  TurnManager.js  perf.js  utils.js
  board/ BoardData.js  BoardRenderer.js  TokenRenderer.js
  games/
    snake/   SnakeBoard.js  SnakeGame.js
    carrom/  CarromGame.js
    chess/   ChessGame.js
    tiger/   TigerGame.js        # 23-pt Aadu Puli Attam
    mancala/ MancalaGame.js      # Pallanguzhi 7 pits
    tambola/ TambolaGame.js      # Housie 1-90
    chowka/  ChowkaGame.js       # 5×5 Chowka Bhara
  features/ Dice.js  AI.js  AudioFX.js  Storage.js  Theme.js  Stats.js  Hints.js
  ui/ SetupScreen.js  HUD.js  Modals.js  Toasts.js  Effects.js
assets/favicon.svg
```

**Principles:** ES modules, one responsibility each · pure rules separate from rendering · engines talk via injected collaborators · lazy-loaded games · GPU-friendly (transform/opacity, will-change, contain, RAF, memoization, debounce) · no framework/bundler.

## 🎮 Controls

**Hub:** 🎮 Games / 8 tabs to switch, G to toggle hub. **Ludo:** Space roll, H hint, Z undo, 1-4 pick token, T theme, R rules, M sound. **Snake:** Space roll, click Roll. **Carrom:** Drag from striker to aim/flick. **Chess:** Tap piece → highlighted squares, Bot vs Bot, promotion dialog. **Tiger:** Tap empty to place Goat, tap Goat/Tiger to move, Bot Tigers. **Pallanguzhi:** Tap own pit to sow. **Tambola:** Call / Auto, auto-mark, first Full House wins. **Chowka:** Throw cowries 🐚, tap glowing token to move.

---
Made with ❤️ in India — Rangoli, teak, ivory & festival lights ✨
