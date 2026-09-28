# 🎮 Bharat Games — भारत खेल

**Festival arcade of Indian classics:** Ludo Legend, Moksha Patam (Snake & Ladder), Carrom & Bharat Chess (Chaturanga) — all Indian styled, modular, and playable in the browser. No build, no deps: just open and play.

## ✨ Games

### 🎲 Ludo Legend — लूडो लेजेंड
2–4 players (human + bots), 6 to leave base, safe stars ⭐, captures ⚔️ with bonus rolls, exact home, 3-six forfeit, hint (H) & undo (Z), dice history, lifetime stats, 4 bot difficulties.

### 🐍 Moksha Patam — Snake & Ladder
10×10 boustrophedon board (1→100), Nagas 🐍 slide down, bamboo ladders 🪜 climb up, peacock safe cells, exact 100 Moksha, extra turn on 6, Indian bamboo & rangoli styling.

### 🏹 Carrom — कैरम
Wooden teak board with powder & gold corners, 9 white + 9 black + queen 🔴, striker flick via drag (aim line + power), elastic collisions with friction & wall bounce, corner pockets — first to 9 wins. Touch + mouse.

### ♔ Bharat Chess — Chaturanga
8×8 teak & ivory, Raja/Mantri/Hathi/Oont/Ghoda/Pyada (King/Queen/Rook/Bishop/Knight/Pawn), legal move highlights, check/checkmate/stalemate, castling, promotion, Human-Human / Human-Bot / Bot-Bot, greedy bot.

Shared: 🇮🇳 festival theme (rangoli, diyas 🪔, light string, gold, Hindi), 4 themes (Festival/Midnight/Ocean/Sunset) via 🎨, synthesized WebAudio, confetti/fireworks, auto-save/resume, responsive 📱.

## 🚀 Run it

Any static server (ES modules need http):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## 🧩 Modular architecture

```
index.html                  # hub shell: header, hub nav/overlay, 4 game sections
css/
  variables.css  themes.css  base.css  board.css  dice.css  panels.css
  modals.css  effects.css  enhancements.css  hub.css  snake.css  carrom.css  chess.css
  responsive.css
js/
  main.js                   # hub boot + Ludo wiring
  hub/GameHub.js            # lazy game switching, Indian hub
  config/constants.js       # colors, rules, difficulty, themes
  core/  GameState.js  Rules.js  TurnManager.js  perf.js  utils.js
  board/ BoardData.js  BoardRenderer.js  TokenRenderer.js
  games/
    snake/ SnakeBoard.js  SnakeGame.js
    carrom/ CarromGame.js
    chess/  ChessGame.js
  features/ Dice.js  AI.js  AudioFX.js  Storage.js  Theme.js  Stats.js  Hints.js
  ui/ SetupScreen.js  HUD.js  Modals.js  Toasts.js  Effects.js
assets/favicon.svg
```

**Principles:** ES modules, one responsibility each · pure rules separate from rendering · engines talk via injected collaborators · lazy-loaded games · GPU-friendly (transform/opacity, will-change, contain, RAF, memoization, debounce) · no framework/bundler.

## 🎮 Controls

**Hub:** 🎮 Games / tabs to switch, G to toggle hub. **Ludo:** Space roll, H hint, Z undo, 1-4 pick token, T theme, R rules, M sound. **Snake:** Space roll, click Roll. **Carrom:** Drag from striker to aim/flick. **Chess:** Tap piece → highlighted squares, Bot vs Bot, promotion dialog.

---
Made with ❤️ in India — Rangoli, teak, ivory & festival lights ✨
