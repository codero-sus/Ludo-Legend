# 🎲 Ludo Legend — लूडो लेजेंड

An interactive, Indian-styled **Ludo** game for the browser. Roll the dice, capture rivals,
and race all four tokens home — against friends (pass-and-play) or smart bots. No build
step, no dependencies: just open it and play.

## ✨ Features

- 🎮 **2–4 players** — mix of Humans (local pass-and-play) and Bots, with custom names
- 🤖 **Smart bot AI** — captures, escapes danger, races for safe stars & home
- 🎲 **3D dice** with roll animation, tap dice / button / `Space` to roll
- ⚔️ **Full classic rules** — 6 to leave base, captures, safe stars, bonus rolls,
  3-sixes forfeit, exact-finish home run (all toggleable house rules!)
- 🏠 Animated token hopping, stacking, captures, home runs & trophy celebrations
- 🔊 Synthesized sound effects (WebAudio, zero assets) with mute toggle
- 💾 **Auto-save + resume** — refresh mid-match and keep playing
- 🎉 Confetti, game log, live standings, player stats & progress bars
- 📱 Fully responsive — desktop, tablet & mobile
- 🇮🇳 Festive Indian theme — rangoli backdrop, gold accents, Hindi tagline

## 🚀 Run it

Any static server works (ES modules need `http(s)`, not `file://`):

```bash
# Python
python3 -m http.server 8000
# Node
npx serve .
```

Then open **http://localhost:8000**.

## 🧩 Modular architecture

```
├── index.html                 # shell: board, side panel, modals
├── css/                       # one stylesheet per concern
│   ├── variables.css          # design tokens (festive theme)
│   ├── base.css               # backdrop, header, layout, footer
│   ├── board.css              # board card, banner, tokens
│   ├── dice.css               # 3D dice cube + roll button
│   ├── panels.css             # player cards, game log
│   ├── modals.css             # dialogs, setup form, toasts, confetti
│   └── responsive.css         # tablet & mobile breakpoints
├── js/
│   ├── main.js                # entry point — wires all modules
│   ├── config/constants.js    # colours, rules, timings, storage keys
│   ├── core/
│   │   ├── GameState.js       # serialisable match state (no UI)
│   │   ├── Rules.js           # pure rule functions (legal moves, captures)
│   │   ├── TurnManager.js     # game engine: turn flow, animation, win logic
│   │   └── utils.js           # wait/rand/dom helpers
│   ├── board/
│   │   ├── BoardData.js       # 15×15 geometry: track, home runs, yards
│   │   ├── BoardRenderer.js   # static SVG board painter
│   │   └── TokenRenderer.js   # HTML pawn layer: position, stacking, highlight
│   ├── features/
│   │   ├── Dice.js            # 3D dice component
│   │   ├── AI.js              # bot move scoring
│   │   ├── AudioFX.js         # WebAudio synth sounds
│   │   └── Storage.js         # localStorage save/resume
│   └── ui/
│       ├── SetupScreen.js     # pre-match config overlay
│       ├── HUD.js             # banner, cards, log, standings
│       ├── Modals.js          # rules + winner dialogs
│       ├── Toasts.js          # notifications
│       └── Effects.js         # confetti canvas
└── assets/favicon.svg
```

**Design principles:** ES modules with one responsibility each · pure, testable rules
separate from rendering · engine (`TurnManager`) talks to UI only through injected
collaborators · no framework, no bundler, no assets to download.

## 🎯 How to play

1. Roll a **6** to bring a token out of base.
2. Tap a **glowing token** to move it clockwise around the board.
3. **Star squares are safe** — everything else is capture territory!
4. Land on enemies to **capture** them (bonus roll 🎁).
5. Get all **4 tokens home** with exact rolls to win. 🏆

Shortcuts: `Space` roll · `R` rules · `M` sound · `N` new game · `Esc` close.

---
Made with ❤️ in India.
