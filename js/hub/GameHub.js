/* ═════════════════════════════════════════════════════════════
   hub/GameHub.js — Global + Bharat Games hub (70 games)
   Indian + Global famous in India + No-country word puzzles
   Keeps each game lazy-loaded, preserves Ludo module as-is.
   ═════════════════════════════════════════════════════════════ */
const GAME_MAP = {
  snake:     { path: "../games/snake/SnakeGame.js", cls: "SnakeGame", id: "snakeGame" },
  carrom:     { path: "../games/carrom/CarromGame.js", cls: "CarromGame", id: "carromGame" },
  chess:     { path: "../games/chess/ChessGame.js", cls: "ChessGame", id: "chessGame" },
  tiger:     { path: "../games/tiger/TigerGame.js", cls: "TigerGame", id: "tigerGame" },
  mancala:     { path: "../games/mancala/MancalaGame.js", cls: "MancalaGame", id: "mancalaGame" },
  tambola:     { path: "../games/tambola/TambolaGame.js", cls: "TambolaGame", id: "tambolaGame" },
  chowka:     { path: "../games/chowka/ChowkaGame.js", cls: "ChowkaGame", id: "chowkaGame" },
  checkers:     { path: "../games/checkers/CheckersGame.js", cls: "CheckersGame", id: "checkersGame" },
  reversi:     { path: "../games/reversi/ReversiGame.js", cls: "ReversiGame", id: "reversiGame" },
  tictactoe:     { path: "../games/tictactoe/TicTacToeGame.js", cls: "TicTacToeGame", id: "tictactoeGame" },
  connect4:     { path: "../games/connect4/Connect4Game.js", cls: "Connect4Game", id: "connect4Game" },
  sudoku:     { path: "../games/sudoku/SudokuGame.js", cls: "SudokuGame", id: "sudokuGame" },
  minesweeper:     { path: "../games/minesweeper/MinesweeperGame.js", cls: "MinesweeperGame", id: "minesweeperGame" },
  memory:     { path: "../games/memory/MemoryGame.js", cls: "MemoryGame", id: "memoryGame" },
  puzzle2048:     { path: "../games/puzzle2048/Puzzle2048Game.js", cls: "Puzzle2048Game", id: "puzzle2048Game" },
  wordmatch:     { path: "../games/wordmatch/WordMatchGame.js", cls: "WordMatchGame", id: "wordmatchGame" },
  backgammon:     { path: "../games/backgammon/BackgammonGame.js", cls: "BackgammonGame", id: "backgammonGame" },
  battleship:     { path: "../games/battleship/BattleshipGame.js", cls: "BattleshipGame", id: "battleshipGame" },
  blackjack:     { path: "../games/blackjack/BlackjackGame.js", cls: "BlackjackGame", id: "blackjackGame" },
  poker:     { path: "../games/poker/PokerGame.js", cls: "PokerGame", id: "pokerGame" },
  solitaire:     { path: "../games/solitaire/SolitaireGame.js", cls: "SolitaireGame", id: "solitaireGame" },
  hangman:     { path: "../games/hangman/HangmanGame.js", cls: "HangmanGame", id: "hangmanGame" },
  wordle:     { path: "../games/wordle/WordleGame.js", cls: "WordleGame", id: "wordleGame" },
  bingo75:     { path: "../games/bingo75/Bingo75Game.js", cls: "Bingo75Game", id: "bingo75Game" },
  monopoly:     { path: "../games/monopoly/MonopolyGame.js", cls: "MonopolyGame", id: "monopolyGame" },
  scrabble:     { path: "../games/scrabble/ScrabbleGame.js", cls: "ScrabbleGame", id: "scrabbleGame" },
  go:     { path: "../games/go/GoGame.js", cls: "GoGame", id: "goGame" },
  yahtzee:     { path: "../games/yahtzee/YahtzeeGame.js", cls: "YahtzeeGame", id: "yahtzeeGame" },
  tetris:     { path: "../games/tetris/TetrisGame.js", cls: "TetrisGame", id: "tetrisGame" },
  teenpatti:  { path: "../games/teenpatti/TeenpattiGame.js", cls: "TeenpattiGame", id: "teenpattiGame" },
  rummy:  { path: "../games/rummy/RummyGame.js", cls: "RummyGame", id: "rummyGame" },
  andarbahar:  { path: "../games/andarbahar/AndarbaharGame.js", cls: "AndarbaharGame", id: "andarbaharGame" },
  jhandimunda:  { path: "../games/jhandimunda/JhandimundaGame.js", cls: "JhandimundaGame", id: "jhandimundaGame" },
  callbreak:  { path: "../games/callbreak/CallbreakGame.js", cls: "CallbreakGame", id: "callbreakGame" },
  bluff:  { path: "../games/bluff/BluffGame.js", cls: "BluffGame", id: "bluffGame" },
  uno:  { path: "../games/uno/UnoGame.js", cls: "UnoGame", id: "unoGame" },
  flames:  { path: "../games/flames/FlamesGame.js", cls: "FlamesGame", id: "flamesGame" },
  dotsboxes:  { path: "../games/dotsboxes/DotsboxesGame.js", cls: "DotsboxesGame", id: "dotsboxesGame" },
  crossword:  { path: "../games/crossword/CrosswordGame.js", cls: "CrosswordGame", id: "crosswordGame" },
  wordsearch:  { path: "../games/wordsearch/WordsearchGame.js", cls: "WordsearchGame", id: "wordsearchGame" },
  indiagk:  { path: "../games/indiagk/IndiagkGame.js", cls: "IndiagkGame", id: "indiagkGame" },
  antakshari:  { path: "../games/antakshari/AntakshariGame.js", cls: "AntakshariGame", id: "antakshariGame" },
  dumbcharades:  { path: "../games/dumbcharades/DumbcharadesGame.js", cls: "DumbcharadesGame", id: "dumbcharadesGame" },
  lagori:  { path: "../games/lagori/LagoriGame.js", cls: "LagoriGame", id: "lagoriGame" },
  khokho:  { path: "../games/khokho/KhokhoGame.js", cls: "KhokhoGame", id: "khokhoGame" },
  kabaddi:  { path: "../games/kabaddi/KabaddiGame.js", cls: "KabaddiGame", id: "kabaddiGame" },
  gillidanda:  { path: "../games/gillidanda/GillidandaGame.js", cls: "GillidandaGame", id: "gillidandaGame" },
  kancha:  { path: "../games/kancha/KanchaGame.js", cls: "KanchaGame", id: "kanchaGame" },
  kite:  { path: "../games/kite/KiteGame.js", cls: "KiteGame", id: "kiteGame" },
  lattu:  { path: "../games/lattu/LattuGame.js", cls: "LattuGame", id: "lattuGame" },
  chorpolice:  { path: "../games/chorpolice/ChorpoliceGame.js", cls: "ChorpoliceGame", id: "chorpoliceGame" },
  rajamantri:  { path: "../games/rajamantri/RajamantriGame.js", cls: "RajamantriGame", id: "rajamantriGame" },
  hideandseek:  { path: "../games/hideandseek/HideandseekGame.js", cls: "HideandseekGame", id: "hideandseekGame" },
  stapu:  { path: "../games/stapu/StapuGame.js", cls: "StapuGame", id: "stapuGame" },
  business:  { path: "../games/business/BusinessGame.js", cls: "BusinessGame", id: "businessGame" },
  sequence:  { path: "../games/sequence/SequenceGame.js", cls: "SequenceGame", id: "sequenceGame" },
  candycrush:  { path: "../games/candycrush/CandycrushGame.js", cls: "CandycrushGame", id: "candycrushGame" },
  snakegame:  { path: "../games/snakegame/SnakegameGame.js", cls: "SnakegameGame", id: "snakegameGame" },
  cricket:  { path: "../games/cricket/CricketGame.js", cls: "CricketGame", id: "cricketGame" },
  football:  { path: "../games/football/FootballGame.js", cls: "FootballGame", id: "footballGame" },
  rubik:  { path: "../games/rubik/RubikGame.js", cls: "RubikGame", id: "rubikGame" },
  fifteen:  { path: "../games/fifteen/FifteenGame.js", cls: "FifteenGame", id: "fifteenGame" },
  mathquiz:  { path: "../games/mathquiz/MathquizGame.js", cls: "MathquizGame", id: "mathquizGame" },
  chain:  { path: "../games/chain/ChainGame.js", cls: "ChainGame", id: "chainGame" },
  colorjump:  { path: "../games/colorjump/ColorjumpGame.js", cls: "ColorjumpGame", id: "colorjumpGame" },
  lucky7:  { path: "../games/lucky7/Lucky7Game.js", cls: "Lucky7Game", id: "lucky7Game" },
  pachisi:  { path: "../games/pachisi/PachisiGame.js", cls: "PachisiGame", id: "pachisiGame" },
  musicalchairs:  { path: "../games/musicalchairs/MusicalchairsGame.js", cls: "MusicalchairsGame", id: "musicalchairsGame" },
  cointoss:  { path: "../games/cointoss/CointossGame.js", cls: "CointossGame", id: "cointossGame" }
};

const NAMES = {
  ludo:"Ludo Legend",
  snake:"Moksha Patam",
  carrom:"Carrom • कैरम",
  chess:"Bharat Chess",
  tiger:"Aadu Puli Attam",
  mancala:"Pallanguzhi",
  tambola:"Tambola",
  chowka:"Chowka Bhara",
  checkers:"Checkers",
  reversi:"Reversi",
  tictactoe:"Tic Tac Toe",
  connect4:"Connect Four",
  sudoku:"Sudoku",
  minesweeper:"Minesweeper",
  memory:"Memory Match",
  puzzle2048:"2048",
  wordmatch:"Word Match 7×5",
  backgammon:"Backgammon",
  battleship:"Battleship",
  blackjack:"Blackjack 21",
  poker:"Texas Hold'em",
  solitaire:"Solitaire",
  hangman:"Hangman",
  wordle:"Wordle",
  bingo75:"Bingo 75",
  monopoly:"Monopoly",
  scrabble:"Scrabble Mini",
  go:"Go 9×9",
  yahtzee:"Yahtzee",
  tetris:"Tetris",
  teenpatti:"Teen Patti",
  rummy:"Indian Rummy",
  andarbahar:"Andar Bahar",
  jhandimunda:"Jhandi Munda",
  callbreak:"Call Break",
  bluff:"Bluff",
  uno:"UNO",
  flames:"FLAMES",
  dotsboxes:"Dots & Boxes",
  crossword:"Crossword",
  wordsearch:"Word Search",
  indiagk:"India GK Quiz",
  antakshari:"Antakshari",
  dumbcharades:"Dumb Charades",
  lagori:"Lagori",
  khokho:"Kho-Kho",
  kabaddi:"Kabaddi",
  gillidanda:"Gilli Danda",
  kancha:"Kancha",
  kite:"Patang",
  lattu:"Lattu",
  chorpolice:"Chor Police",
  rajamantri:"Raja Mantri",
  hideandseek:"Hide & Seek",
  stapu:"Stapu",
  business:"Business",
  sequence:"Sequence",
  candycrush:"Candy Crush",
  snakegame:"Snake Nokia",
  cricket:"Gully Cricket",
  football:"Football Penalty",
  rubik:"Rubik's Cube",
  fifteen:"15 Puzzle",
  mathquiz:"Math Quiz",
  chain:"Chain Chain",
  colorjump:"Color Jump",
  lucky7:"Lucky 7",
  pachisi:"Pachisi",
  musicalchairs:"Musical Chairs",
  cointoss:"Head & Tail"
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
