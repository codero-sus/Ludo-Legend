# 🎮 Global & Bharat Games — 70 Classics 🌍🇮🇳

**Festival arcade of 70:** 8 Bharat classics + 22 global famous-in-India + 40 *too much famous in India* street/card/puzzle hits + no-country word puzzles — all styled, modular, and playable in the browser. No build, no deps: just `python3 -m http.server 8000` and play.

## ✨ 70 Games

### 🎲 Indian / Bharat — 8
**Ludo Legend — लूडो लेजेंड** — 2-4 players, safe ⭐, captures ⚔️. **Moksha Patam — Snake & Ladder** — 1→100 Nagas 🐍 & ladders 🪜. **Carrom — कैरम** — very famous global style in India, wooden teak physics. **Bharat Chess — Chaturanga** — Raja/Mantri/Hathi. **Aadu Puli Attam** — 3 🐯 vs 15 🐐 23-pt. **Pallanguzhi** — Tamil Mancala 7 pits. **Tambola 90** — Housie 1-90. **Chowka Bhara** — 5×5 cowries.

### 🌍 Global Famous in India — 14
**Checkers** 8×8, **Reversi** Othello, **Tic Tac Toe** 3×3, **Connect Four** 7×6, **Sudoku** 9×9, **Minesweeper** 9×9, **Memory** 4×4, **2048** 4×4, **Backgammon** 24pt, **Battleship** 10×10, **Blackjack 21**, **Texas Hold'em Poker**, **Solitaire** Klondike, **Bingo 75**, **Monopoly**, **Scrabble Mini 7×7**, **Go 9×9**, **Yahtzee**, **Tetris** — all viral in India.

### 🔤 No-Country Word Puzzles — 4
**Hangman — Guess the Word**, **Wordle — Find the Word (5×6 web hit)**, **Word Match 7×5** — *always rectangle 7×5 (35 letters) Boggle — bigger than Tic Tac Toe*, **Scrabble** (also). No country — pure letters.

### 🇮🇳 Too Much Famous in India — 40 NEW
*Street, gully, family & Diwali famous — played in every Indian home/school:*

**Card & Casino famous:** **Teen Patti** 🃏 3 cards (India's #1), **Indian Rummy** ♠️ 13 cards melds, **Andar Bahar** ♦️ Andar vs Bahar, **Jhandi Munda** 🎲 6 dice symbols (NE India), **Call Break** ♣️ trick, **Bluff** 🤥 cheat, **UNO** 🌈 color match — youth craze, **Business** 💼 Indian Monopoly, **Sequence** 🔢 5 in row — plus **Pachisi** 🎲 ancient Ludo.

**Street & Gully:** **Lagori (7 Stones)** 🪨, **Kho-Kho** 🏃, **Kabaddi** 🤼, **Gilli Danda** 🏏, **Kancha (Marbles)** 🔵, **Patang (Kite Flying)** 🪁 Sankranti, **Lattu (Spinning Top)** 🌀, **Chor Police** 👮, **Raja Mantri Chor Sipahi** 👑, **Hide & Seek (Chuppan Chupai)** 🙈, **Stapu (Hopscotch)** 🦶, **Chain Chain** ⛓️, **Musical Chairs** 🪑, **Gilli** already, **Pachisi**.

**Word & School famous:** **FLAMES** ❤️ love paper game — every Indian school, **Dots & Boxes** ⬜, **Crossword** 📝 newspaper, **Word Search** 🔍, **India GK Quiz** 🇮🇳, **Antakshari** 🎤 family singing, **Dumb Charades** 🎭.

**Arcade & Puzzle famous:** **Candy Crush** 🍬 match-3 — India mobile #1, **Snake Nokia** 🐍, **Gully Cricket** 🏏 — India #1 sport, **Football Penalty** ⚽, **Rubik's Cube** 🧩, **15 Puzzle** 🔢 sliding, **Math Quiz** 🧮, **Color Jump (Chidiya Udd)** 🐦, **Lucky 7** 🎰, **Spin to Win** 🎡, **Head & Tail (Coin Toss)** 🪙 — gully toss.

> All 40 are *too much famous in India* — played in streets, homes, schools, festivals, Diwali & gullies!

Shared: 🇮🇳 festival + 🌍 Vegas/neon/wood themes, 4 themes via 🎨, synthesized WebAudio, confetti, responsive 📱.

## ⚠️ Responsible Gaming Disclosure
**English (top):** Gambling is dangerous. This app contains *simulated* gambling (Teen Patti, Poker, Blackjack, Andar Bahar, Jhandi Munda, Rummy, Call Break, Bingo/Tambola, Lucky 7, etc.) for entertainment only — no real money. Gambling can be addictive, cause serious financial loss, debt and harm. Play responsibly, set limits, take breaks, never chase losses. You must be **18+**.

**Your language (below, auto-detected via JavaScript):** When you press **🚪 Exit**, a full-screen warning appears with the same text translated into your country's language (detected via `navigator.language` + `Intl`). First time you must wait **30 seconds** to dismiss (to ensure you read it) and confirm *“I understand, I am 18+”*; later exits require **3 seconds**. The warning shows English on top and your detected language below.

**How it works:** `js/ui/GamblingWarning.js` + `css/gambling.css` + `#exitBtn` / `#quitBtn` / `beforeunload` / back-button hooks. Delay stored in `localStorage` (`gambling_warning_seen`). Translations for hi, bn, ta, te, mr, gu, ur, pa, ml, kn, es, fr, de, pt, ru, ar, zh, ja, ko, it, tr, nl, id, pl, th, vi, etc.

## 🚀 Run it
```bash
python3 -m http.server 8000
# then open http://localhost:8000  → hub shows 70 cards, G to toggle hub
```

## 🧩 Modular architecture
```
index.html                  # hub shell: header, 70-tab hub nav/overlay, 70 game sections
css/
  variables.css  themes.css  base.css  board.css  dice.css  panels.css
  modals.css  effects.css  enhancements.css  hub.css  gambling.css
  snake.css  carrom.css  chess.css  tiger.css  mancala.css  tambola.css  chowka.css
  checkers.css  reversi.css  tictactoe.css  connect4.css  sudoku.css  minesweeper.css
  memory.css  puzzle2048.css  wordmatch.css  backgammon.css  battleship.css
  blackjack.css  poker.css  solitaire.css  hangman.css  wordle.css  bingo75.css
  monopoly.css  scrabble.css  go.css  yahtzee.css  tetris.css
  teenpatti.css  rummy.css  andarbahar.css  jhandimunda.css  callbreak.css  bluff.css  uno.css
  flames.css  dotsboxes.css  crossword.css  wordsearch.css  indiagk.css  antakshari.css  dumbcharades.css
  lagori.css  khokho.css  kabaddi.css  gillidanda.css  kancha.css  kite.css  lattu.css
  chorpolice.css  rajamantri.css  hideandseek.css  stapu.css  business.css  sequence.css
  candycrush.css  snakegame.css  cricket.css  football.css  rubik.css  fifteen.css  mathquiz.css
  chain.css  colorjump.css  lucky7.css  pachisi.css  musicalchairs.css  cointoss.css
  responsive.css
js/
  main.js                   # hub boot + Ludo + 70-game hub + GamblingWarning
  hub/GameHub.js            # lazy switching, 70 games (GAME_MAP)
  ui/GamblingWarning.js     # 30s first / 3s later, English + detected local via navigator.language
  ...
  games/
    snake/  carrom/ chess/ tiger/ mancala/ tambola/ chowka/
    checkers/ reversi/ tictactoe/ connect4/ sudoku/ minesweeper/ memory/ puzzle2048/ wordmatch/ backgammon/ battleship/ blackjack/ poker/ solitaire/ hangman/ wordle/ bingo75/ monopoly/ scrabble/ go/ yahtzee/ tetris/
    teenpatti/ rummy/ andarbahar/ jhandimunda/ callbreak/ bluff/ uno/ flames/ dotsboxes/ crossword/ wordsearch/ indiagk/ antakshari/ dumbcharades/ lagori/ khokho/ kabaddi/ gillidanda/ kancha/ kite/ lattu/ chorpolice/ rajamantri/ hideandseek/ stapu/ business/ sequence/ candycrush/ snakegame/ cricket/ football/ rubik/ fifteen/ mathquiz/ chain/ colorjump/ lucky7/ pachisi/ musicalchairs/ cointoss/
```
**Principles:** ES modules, lazy `import()`, GPU-friendly, no bundler.

## 🎮 Controls
**Hub:** 🎮 70 Games / 70 tabs, G to toggle. **Ludo:** Space/H/Z etc. **All others:** see 📖 Rules per game. **Word Match 7×5:** 7×5 rectangle → adjacent → Submit. **Exit:** 🚪 Exit → responsible gaming warning (30s first, 3s later) English + your language.

---
Made with ❤️ in India — 70 games — Bharat + Global + too much famous in India 🌍🇮🇳✨
