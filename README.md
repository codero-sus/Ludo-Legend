# 🎮 Global & Bharat Games — 30 Classics 🌍🇮🇳

**Festival arcade of 30:** 8 Bharat classics + 22 global famous-in-India hits + no-country word puzzles — all styled, modular, and playable in the browser. No build, no deps: just `python3 -m http.server 8000` and play.

## ✨ 30 Games

### 🎲 Indian / Bharat — 8

**Ludo Legend — लूडो लेजेंड** — 2-4 players (human + bots), 6 to leave, safe ⭐, captures ⚔️, exact home, hint (H) & undo (Z).

**Moksha Patam — Snake & Ladder** — 10×10 boustrophedon 1→100, Nagas 🐍 & bamboo ladders 🪜, exact 100 Moksha.

**Carrom — कैरम** — Very famous global style game in India — wooden teak, 9+9+queen, striker flick with physics (friction 0.985).

**Bharat Chess — Chaturanga** — 8×8 teak & ivory, Raja/Mantri/Hathi/Oont/Ghoda/Pyada, check/mate, Human/Bot.

**Aadu Puli Attam — Tiger & Goat** — 23-pt forest, 3 🐯 vs 15 🐐, place 15 goats vs jump-capture tigers.

**Pallanguzhi — Mancala** — Tamil 7 pits + store, 6 seeds, sow clockwise, extra on store, capture.

**Tambola — Housie (90-ball)** — 1-90 caller, 3×9 ticket (5/row, col ranges), You vs 3 bots, Early 5 / lines / Full House.

**Chowka Bhara — Ashta Chamma** — 5×5 cross, 4 cowries (0 up=8), need 1/8 to enter, safe ⭐, exact centre home.

### 🌍 Global Famous in India — 18

**Checkers — Draughts** — 8×8 red/black, must capture, King crowns at last row, Bot.

**Reversi — Othello** — 8×8, outflank to flip all bracketed lines, most discs wins.

**Tic Tac Toe** — 3×3, bot win/block/center, classic beyond country.

**Connect Four** — 7×6, drop to connect 4 (h/v/d), globally famous in India.

**Sudoku** — 9×9 puzzle, 1-9 per row/col/box, generates solved then removes 40, check/solve.

**Minesweeper** — 9×9, 10 mines, numbers = adjacent, flag 🚩, auto-reveal.

**Memory Match — Concentration** — 4×4 flip two, find 8 pairs, no-country memory game.

**2048** — 4×4 slide merge (⬆⬇⬅➡), pastel tiles, reach 2048, very viral in India.

**Backgammon** — 24 points, 2 dice, hit blot → bar, bear off, simplified Vs Bot.

**Battleship** — 10×10, 5 ships (5,4,3,3,2), fire on enemy waters, Navy style.

**Blackjack 21** — Vegas green felt, A=1/11, hit/stand, dealer hits <17, Diwali famous.

**Texas Hold'em Poker** — 2 hole +5 community = best 5-card hand, hand ranks, vs 2 bots.

**Solitaire — Klondike** — 52 cards, stock→waste→tableau/foundation, Auto Play, Windows famous in India.

**Bingo 75 — B-I-N-G-O** — Western 75-ball, B 1-15 ... O 61-75, 5×5 free centre, line Bingo, club famous.

**Monopoly — Deal** — 40 spaces, roll 2 dice, buy/rent, pass GO +$200, India famous board game.

**Scrabble Mini** — 7×7 crossword, rack 7, TW/DW/TL/DL bonuses, ★ centre start, dictionary check.

**Go 9×9** — Black vs White, surround to capture, suicide illegal, pass twice = end.

**Yahtzee** — 5 dice, 3 rolls/hold, 13 categories, upper bonus 35 if ≥63, dice poker.

**Tetris** — 10×20 well, 7 tetrominoes (I,O,T,S,Z,J,L), rotate/move/drop, line clear, arcade famous worldwide.

### 🔤 No-Country Word Puzzles — 4 (requested)

**Hangman — Guess the Word** — Guess letters, 6 lives, random Bharat/global words, no country — pure letters.

**Wordle — Find the Word from Web** — Guess 5-letter word in 6 tries, 🟩/🟨/⬜, globally viral web game, no country.

**Word Match 7×5 — Boggle on Tic Tac Toe map but bigger** — *Always rectangle* 7 columns ×5 rows (35 letters), tap adjacent (8-dir, no reuse) to form words 3+ letters, dictionary check, score = length², ⏱ 90s per grid — bigger than Tic Tac Toe, rectangle always!

**Scrabble Mini** also counts as no-country word play, plus **Hangman/Wordle** above.

Shared: 🇮🇳 festival + 🌍 Vegas/neon/wood themes, 4 themes (Festival/Midnight/Ocean/Sunset) via 🎨, synthesized WebAudio, confetti, responsive 📱.

## 🚀 Run it

Any static server (ES modules need http):

```bash
python3 -m http.server 8000
# then open http://localhost:8000  → hub shows 30 cards, G to toggle hub
```

## 🧩 Modular architecture

```
index.html                  # hub shell: header, 30-tab hub nav/overlay, 30 game sections
css/
  variables.css  themes.css  base.css  board.css  dice.css  panels.css
  modals.css  effects.css  enhancements.css  hub.css
  snake.css  carrom.css  chess.css  tiger.css  mancala.css  tambola.css  chowka.css
  checkers.css  reversi.css  tictactoe.css  connect4.css  sudoku.css  minesweeper.css
  memory.css  puzzle2048.css  wordmatch.css  backgammon.css  battleship.css
  blackjack.css  poker.css  solitaire.css  hangman.css  wordle.css  bingo75.css
  monopoly.css  scrabble.css  go.css  yahtzee.css  tetris.css
  responsive.css
js/
  main.js                   # hub boot + Ludo wiring + 30-game hub
  hub/GameHub.js            # lazy game switching, 30 games (GAME_MAP)
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
    checkers/ CheckersGame.js    # 8×8 draughts
    reversi/  ReversiGame.js     # Othello
    tictactoe/ TicTacToeGame.js  # 3×3
    connect4/ Connect4Game.js    # 7×6
    sudoku/   SudokuGame.js      # 9×9
    minesweeper/ MinesweeperGame.js
    memory/   MemoryGame.js      # 4×4
    puzzle2048/ Puzzle2048Game.js
    wordmatch/ WordMatchGame.js  # 7×5 rectangle Boggle
    backgammon/ BackgammonGame.js
    battleship/ BattleshipGame.js
    blackjack/ BlackjackGame.js
    poker/    PokerGame.js       # Texas Hold'em
    solitaire/ SolitaireGame.js  # Klondike
    hangman/  HangmanGame.js     # Guess the word
    wordle/   WordleGame.js      # Find the word (5×6 web hit)
    bingo75/  Bingo75Game.js     # 75-ball B-I-N-G-O
    monopoly/ MonopolyGame.js    # 40 spaces
    scrabble/ ScrabbleGame.js    # 7×7 crossword
    go/       GoGame.js          # 9×9
    yahtzee/  YahtzeeGame.js     # 5 dice
    tetris/   TetrisGame.js      # 10×20
  features/ Dice.js  AI.js  AudioFX.js  Storage.js  Theme.js  Stats.js  Hints.js
  ui/ SetupScreen.js  HUD.js  Modals.js  Toasts.js  Effects.js
assets/favicon.svg
```

**Principles:** ES modules, one responsibility each · pure rules separate from rendering · lazy-loaded games via dynamic `import()` · GPU-friendly (transform/opacity, will-change, contain, RAF) · no framework/bundler.

## 🎮 Controls

**Hub:** 🎮 30 Games / 30 tabs, G to toggle. **Ludo:** Space roll, H hint, Z undo, 1-4 pick, T theme. **Moksha/Carrom/Chess/Tiger/Pallanguzhi/Tambola/Chowka:** see Rules (📖) per game. **Checkers/Reversi/TicTac/Connect4/Sudoku/Mines/Memory/2048/Backgammon/Battleship/Blackjack/Poker/Solitaire/Monopoly/Go/Yahtzee/Tetris:** tap/click + specific (dice roll, hit/stand, etc.). **Word games:** Hangman tap letters; Wordle type 5 letters + Enter; **Word Match 7×5:** tap adjacent letters in 7×5 rectangle → Submit if dictionary word (3+) — score length², 90s timer; Scrabble click rack → board → Place.

---
Made with ❤️ in India — Rangoli + Vegas + global 🌍✨ — 30 games in one arcade!
