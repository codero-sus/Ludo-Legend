/* ═════════════════════════════════════════════════════════════
   hub/GameHub.js — Global + Bharat Games hub (30 games)
   Indian: Ludo, Moksha Patam, Carrom, Chaturanga, Aadu Puli, Pallanguzhi, Tambola, Chowka
   Global: Checkers, Reversi, TicTacToe, Connect4, Sudoku, Minesweeper, Memory, 2048,
           Word Match 7x5, Backgammon, Battleship, Blackjack, Poker, Solitaire,
           Hangman, Wordle, Bingo75, Monopoly, Scrabble, Go, Yahtzee, Tetris
   Keeps each game lazy-loaded, preserves Ludo module as-is.
   ═════════════════════════════════════════════════════════════ */
const GAME_MAP = {
  snake:     { path: "../games/snake/SnakeGame.js",       cls: "SnakeGame",       id: "snakeGame" },
  carrom:    { path: "../games/carrom/CarromGame.js",     cls: "CarromGame",      id: "carromGame" },
  chess:     { path: "../games/chess/ChessGame.js",        cls: "ChessGame",       id: "chessGame" },
  tiger:     { path: "../games/tiger/TigerGame.js",        cls: "TigerGame",       id: "tigerGame" },
  mancala:   { path: "../games/mancala/MancalaGame.js",    cls: "MancalaGame",     id: "mancalaGame" },
  tambola:   { path: "../games/tambola/TambolaGame.js",    cls: "TambolaGame",     id: "tambolaGame" },
  chowka:    { path: "../games/chowka/ChowkaGame.js",      cls: "ChowkaGame",      id: "chowkaGame" },
  checkers:  { path: "../games/checkers/CheckersGame.js",  cls: "CheckersGame",    id: "checkersGame" },
  reversi:   { path: "../games/reversi/ReversiGame.js",    cls: "ReversiGame",     id: "reversiGame" },
  tictactoe: { path: "../games/tictactoe/TicTacToeGame.js",cls: "TicTacToeGame",   id: "tictactoeGame" },
  connect4:  { path: "../games/connect4/Connect4Game.js",  cls: "Connect4Game",    id: "connect4Game" },
  sudoku:    { path: "../games/sudoku/SudokuGame.js",      cls: "SudokuGame",      id: "sudokuGame" },
  minesweeper:{path: "../games/minesweeper/MinesweeperGame.js", cls:"MinesweeperGame", id:"minesweeperGame"},
  memory:    { path: "../games/memory/MemoryGame.js",      cls: "MemoryGame",      id: "memoryGame" },
  puzzle2048:{ path: "../games/puzzle2048/Puzzle2048Game.js",cls:"Puzzle2048Game", id:"puzzle2048Game"},
  wordmatch: { path: "../games/wordmatch/WordMatchGame.js",cls: "WordMatchGame",   id: "wordmatchGame"},
  backgammon:{ path: "../games/backgammon/BackgammonGame.js",cls:"BackgammonGame", id:"backgammonGame"},
  battleship:{ path: "../games/battleship/BattleshipGame.js",cls:"BattleshipGame", id:"battleshipGame"},
  blackjack: { path: "../games/blackjack/BlackjackGame.js",cls: "BlackjackGame",   id: "blackjackGame"},
  poker:     { path: "../games/poker/PokerGame.js",        cls: "PokerGame",       id: "pokerGame"},
  solitaire: { path: "../games/solitaire/SolitaireGame.js",cls: "SolitaireGame",   id: "solitaireGame"},
  hangman:   { path: "../games/hangman/HangmanGame.js",    cls: "HangmanGame",     id: "hangmanGame"},
  wordle:    { path: "../games/wordle/WordleGame.js",      cls: "WordleGame",      id: "wordleGame"},
  bingo75:   { path: "../games/bingo75/Bingo75Game.js",    cls: "Bingo75Game",     id: "bingo75Game"},
  monopoly:  { path: "../games/monopoly/MonopolyGame.js",  cls: "MonopolyGame",    id: "monopolyGame"},
  scrabble:  { path: "../games/scrabble/ScrabbleGame.js",  cls: "ScrabbleGame",    id: "scrabbleGame"},
  go:        { path: "../games/go/GoGame.js",              cls: "GoGame",          id: "goGame"},
  yahtzee:   { path: "../games/yahtzee/YahtzeeGame.js",     cls: "YahtzeeGame",     id: "yahtzeeGame"},
  tetris:    { path: "../games/tetris/TetrisGame.js",      cls: "TetrisGame",      id: "tetrisGame"},
};

const NAMES = {
  ludo:"Ludo Legend", snake:"Moksha Patam", carrom:"Carrom • कैरम", chess:"Bharat Chess",
  tiger:"Aadu Puli Attam", mancala:"Pallanguzhi", tambola:"Tambola", chowka:"Chowka Bhara",
  checkers:"Checkers", reversi:"Reversi", tictactoe:"Tic Tac Toe", connect4:"Connect Four",
  sudoku:"Sudoku", minesweeper:"Minesweeper", memory:"Memory Match", puzzle2048:"2048",
  wordmatch:"Word Match 7×5", backgammon:"Backgammon", battleship:"Battleship",
  blackjack:"Blackjack 21", poker:"Texas Hold'em", solitaire:"Solitaire",
  hangman:"Hangman", wordle:"Wordle", bingo75:"Bingo 75", monopoly:"Monopoly",
  scrabble:"Scrabble Mini", go:"Go 9×9", yahtzee:"Yahtzee", tetris:"Tetris"
};

export class GameHub {
  constructor({ hubOverlay, hubNav, gameSections, triggerBtn }) {
    this.hubOverlay = hubOverlay;
    this.hubNav = hubNav;
    this.sections = gameSections;
    this.triggerBtn = triggerBtn;
    this.current = "ludo";
    this._inited = new Set();
    this._modules = {};

    this.hubNav?.querySelectorAll("[data-game]").forEach(btn=>{
      btn.addEventListener("click", ()=> this.showGame(btn.dataset.game, true));
    });
    this.hubOverlay?.querySelectorAll("[data-jump]").forEach(c=>{
      c.addEventListener("click", ()=> {
        this.hubOverlay.classList.remove("show");
        this.showGame(c.dataset.jump, true);
      });
    });
    this.triggerBtn?.addEventListener("click", ()=> this.toggleHub());
    this.hubOverlay?.addEventListener("click", (e)=>{
      if(e.target===this.hubOverlay) this.hubOverlay.classList.remove("show");
    });
    this.showGame("ludo", false);
  }

  toggleHub(){ this.hubOverlay.classList.toggle("show"); }
  openHub(){ this.hubOverlay.classList.add("show"); }
  closeHub(){ this.hubOverlay.classList.remove("show"); }

  async showGame(name, withToast=false){
    if(!this.sections[name]) return;
    this.current = name;
    Object.entries(this.sections).forEach(([k,el])=>{
      el.classList.toggle("active", k===name);
      el.classList.toggle("game-section", true);
    });
    this.hubNav?.querySelectorAll("[data-game]").forEach(b=> b.classList.toggle("active", b.dataset.game===name));
    this.hubOverlay?.querySelectorAll("[data-jump]").forEach(c=> c.classList.toggle("active", c.dataset.jump===name));

    if(!this._inited.has(name)){
      this._inited.add(name);
      try{
        if(name!=="ludo" && GAME_MAP[name]){
          const g = GAME_MAP[name];
          const m = await import(g.path);
          const Cls = m[g.cls];
          this._modules[name] = new Cls(document.getElementById(g.id));
          this._modules[name].init();
        }
      }catch(e){ console.error("Game load failed", name, e); }
    } else {
      this._modules[name]?.onShow?.();
    }
    Object.entries(this._modules).forEach(([k,mod])=>{
      if(k!==name) mod?.onHide?.();
    });

    if(withToast){
      const box=document.getElementById("toastBox");
      if(box){
        const t=document.createElement("div"); t.className="toast gold"; t.textContent=`🎮 ${NAMES[name] || name}`;
        box.appendChild(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),300); },1800);
      }
    }
    window.scrollTo({top:0, behavior:"smooth"});
  }
}
