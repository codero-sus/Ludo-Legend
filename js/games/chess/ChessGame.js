/* ═════════════════════════════════════════════════════════════
   games/chess/ChessGame.js — Bharat Chess (Chaturanga inspired)
   8x8, Indian styled: Raja/Mantri/Hathi/Ghoda/Oont/Pyada
   Full move validation, check, checkmate, promotion, castling simplified
   Bot: greedy material + random
   ═════════════════════════════════════════════════════════════ */
import { rand } from "../../core/utils.js";

const PIECES = {
  // white (0) is bottom (rank 1), black (1) top (rank 8)
  // Use unicode but styled as Indian: Raja ♔, Mantri ♕, Hathi ♖, Oont ♗, Ghoda ♘, Pyada ♙
  // We'll map to standard then render with Indian labels on promotion
};

function initBoard(){
  // 8x8 array [row][col], row 0 = rank 8 (black back), row 7 = rank 1 (white)
  const empty = Array(8).fill(null).map(()=>Array(8).fill(null));
  const back = ["r","n","b","q","k","b","n","r"];
  for(let c=0;c<8;c++){
    empty[0][c]={type:back[c], color:"b", hasMoved:false};
    empty[1][c]={type:"p", color:"b", hasMoved:false};
    empty[6][c]={type:"p", color:"w", hasMoved:false};
    empty[7][c]={type:back[c], color:"w", hasMoved:false};
  }
  return empty;
}

const SYMBOL = {
  "k": {w:"♔", b:"♚"}, "q": {w:"♕", b:"♛"}, "r": {w:"♖", b:"♜"}, "b": {w:"♗", b:"♝"}, "n": {w:"♘", b:"♞"}, "p": {w:"♙", b:"♟"}
};
const INDIAN_NAME = {k:"Raja", q:"Mantri", r:"Hathi", b:"Oont", n:"Ghoda", p:"Pyada"};

function inBoard(r,c){ return r>=0&&r<8&&c>=0&&c<8; }

function pieceMoves(board, r,c){
  const p=board[r][c]; if(!p) return [];
  const moves=[];
  const dir = p.color==="w" ? -1 : 1;
  if(p.type==="p"){
    // forward
    if(inBoard(r+dir,c) && !board[r+dir][c]) {
      moves.push([r+dir,c]);
      if(!p.hasMoved && inBoard(r+dir*2,c) && !board[r+dir*2][c]) moves.push([r+dir*2,c]);
    }
    // captures
    for(const dc of [-1,1]){
      if(inBoard(r+dir,c+dc) && board[r+dir][c+dc] && board[r+dir][c+dc].color!==p.color) moves.push([r+dir,c+dc]);
    }
  } else if(p.type==="n"){
    for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){
      const nr=r+dr, nc=c+dc;
      if(inBoard(nr,nc) && (!board[nr][nc] || board[nr][nc].color!==p.color)) moves.push([nr,nc]);
    }
  } else if(p.type==="b" || p.type==="r" || p.type==="q" || p.type==="k"){
    const dirs=[];
    if(p.type==="b"||p.type==="q") dirs.push(...[[-1,-1],[-1,1],[1,-1],[1,1]]);
    if(p.type==="r"||p.type==="q") dirs.push(...[[-1,0],[1,0],[0,-1],[0,1]]);
    if(p.type==="k") dirs.push(...[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
    for(const [dr,dc] of dirs){
      let nr=r+dr, nc=c+dc;
      const limit = p.type==="k" ? 1 : 7;
      for(let s=0;s<limit;s++){
        if(!inBoard(nr,nc)) break;
        if(!board[nr][nc]) moves.push([nr,nc]);
        else {
          if(board[nr][nc].color!==p.color) moves.push([nr,nc]);
          break;
        }
        if(p.type==="k") break;
        nr+=dr; nc+=dc;
      }
    }
    // castling simplified: if king and rook haven't moved and path clear, allow
    if(p.type==="k" && !p.hasMoved){
      // kingside
      if(board[r][5]===null && board[r][6]===null && board[r][7]?.type==="r" && !board[r][7].hasMoved) moves.push([r,6]);
      if(board[r][1]===null && board[r][2]===null && board[r][3]===null && board[r][0]?.type==="r" && !board[r][0].hasMoved) moves.push([r,2]);
    }
  }
  return moves;
}

function isKingInCheck(board, color){
  // find king
  let kr=-1,kc=-1;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]?.type==="k" && board[r][c].color===color){ kr=r;kc=c; }
  if(kr===-1) return false;
  const opp=color==="w"?"b":"w";
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]?.color===opp){
      const ms=pieceMoves(board,r,c);
      if(ms.some(([mr,mc])=>mr===kr&&mc===kc)) return true;
    }
  }
  return false;
}

function legalMoves(board, r,c, color){
  const p=board[r][c];
  if(!p || p.color!==color) return [];
  const pseudo=pieceMoves(board,r,c);
  const legal=[];
  for(const [nr,nc] of pseudo){
    // simulate
    const copy=board.map(row=>row.map(cell=> cell? {...cell}:null));
    const moving=copy[r][c];
    // castling move rook
    if(moving.type==="k" && Math.abs(nc-c)===2){
      const rookFromCol = nc===6 ? 7 : 0;
      const rookToCol = nc===6 ? 5 : 3;
      copy[r][rookToCol]=copy[r][rookFromCol];
      copy[r][rookFromCol]=null;
      if(copy[r][rookToCol]) copy[r][rookToCol].hasMoved=true;
    }
    copy[nr][nc]=moving; copy[r][c]=null;
    moving.hasMoved=true;
    // pawn promotion handled elsewhere
    if(!isKingInCheck(copy, color)) legal.push([nr,nc]);
  }
  return legal;
}

function allLegalMoves(board, color){
  const res=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]?.color===color){
    const ms=legalMoves(board,r,c,color);
    for(const m of ms) res.push({from:[r,c], to:m, piece:board[r][c]});
  }
  return res;
}

function isCheckmate(board, color){
  if(!isKingInCheck(board,color)) return false;
  return allLegalMoves(board,color).length===0;
}
function isStalemate(board,color){
  if(isKingInCheck(board,color)) return false;
  return allLegalMoves(board,color).length===0;
}

export class ChessGame {
  constructor(root){
    this.root=root;
    this.board=initBoard();
    this.turn="w";
    this.selected=null;
    this.legal=[];
    this.history=[];
    this.lastMove=null;
    this.gameOver=false;
    this.mode="human-bot"; // human vs bot
    this.botColor="b";
  }

  init(){
    this.root.innerHTML=`
      <div class="chess-layout">
        <div class="chess-card">
          <div class="chess-banner">♔ Bharat Chess <span style="opacity:.85;font-weight:400">· Chaturanga — Indian Royal Game</span></div>
          <div class="chess-board-wrap"><div id="chessBoard"></div></div>
          <div class="chess-controls">
            <div style="flex:1">
              <div id="chessTurn" style="font-family:var(--font-display);font-weight:700;color:var(--ink)">White to move — Raja's turn</div>
              <div id="chessHint" style="font-size:.82rem;color:var(--ink-soft)">Tap a piece, then a highlighted square</div>
            </div>
            <button id="chessUndo" class="ghost-btn" style="color:var(--ink);border-color:#c9bfa5">↩️ Undo</button>
            <button id="chessReset" class="gold-btn" style="padding:9px 16px">🔄 New Game</button>
          </div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block">
            <h3 class="panel-title">⚔️ Mode</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button data-mode="human-human" class="chip-btn chess-mode">👥 Human vs Human</button>
              <button data-mode="human-bot" class="chip-btn chess-mode active">🤖 Human vs Bot</button>
              <button data-mode="bot-bot" class="chip-btn chess-mode">🤖 Bot vs Bot</button>
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
              <span style="font-size:.82rem;color:rgba(255,255,255,.8)">Play as</span>
              <button id="chessColorW" class="mini-action" style="padding:6px 12px;border:2px solid #fff">♔ White</button>
              <button id="chessColorB" class="mini-action" style="padding:6px 12px">♚ Black</button>
            </div>
          </div>
          <div class="panel-block chess-panel">
            <h3 class="panel-title">📜 Moves <button id="chessCopy" class="mini-btn">copy</button></h3>
            <ol id="chessHistory" class="history"></ol>
          </div>
          <div class="panel-block">
            <h3 class="panel-title">🪷 Indian Names</h3>
            <div style="font-size:.78rem;line-height:1.7;color:rgba(255,255,255,.9)">
              <b>Raja</b> (King) ♔, <b>Mantri</b> (Queen) ♕, <b>Hathi</b> (Rook) ♖,<br>
              <b>Oont</b> (Bishop) ♗, <b>Ghoda</b> (Knight) ♘, <b>Pyada</b> (Pawn) ♙
            </div>
          </div>
        </aside>
      </div>
      <div id="chessPromo" class="overlay" style="display:none;z-index:120">
        <div class="dialog" style="max-width:380px;text-align:center">
          <h3 style="font-family:var(--font-display)">Promote Pyada to</h3>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px" id="promoChoices"></div>
        </div>
      </div>
    `;
    this.boardEl=this.root.querySelector("#chessBoard");
    this.turnEl=this.root.querySelector("#chessTurn");
    this.hintEl=this.root.querySelector("#chessHint");
    this.historyEl=this.root.querySelector("#chessHistory");
    this.promoOverlay=this.root.querySelector("#chessPromo");
    this.promoChoices=this.root.querySelector("#promoChoices");

    this.root.querySelector("#chessReset").addEventListener("click",()=> this.reset());
    this.root.querySelector("#chessUndo").addEventListener("click",()=> this.undo());
    this.root.querySelector("#chessCopy").addEventListener("click",()=> {
      const txt=Array.from(this.historyEl.children).map(li=>li.textContent).join("\n");
      navigator.clipboard?.writeText(txt);
    });
    this.root.querySelectorAll(".chess-mode").forEach(b=>{
      b.addEventListener("click",()=>{
        this.root.querySelectorAll(".chess-mode").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        this.mode=b.dataset.mode;
        this.reset();
      });
    });
    this.root.querySelector("#chessColorW").addEventListener("click",()=> this.setBotColor("b"));
    this.root.querySelector("#chessColorB").addEventListener("click",()=> this.setBotColor("w"));
    this.setBotColor("b");
    this.render();
    this.updateStatus();
  }

  setBotColor(c){
    this.botColor=c;
    this.root.querySelector("#chessColorW").style.borderColor = c==="b" ? "#fff" : "transparent";
    this.root.querySelector("#chessColorW").style.background = c==="b" ? "var(--gold)" : "";
    this.root.querySelector("#chessColorB").style.borderColor = c==="w" ? "#fff" : "transparent";
    this.root.querySelector("#chessColorB").style.background = c==="w" ? "var(--gold)" : "";
    if(this.mode==="human-bot") this.maybeBotMove();
  }

  onShow(){ this.render(); }
  onHide(){}

  reset(){
    this.board=initBoard(); this.turn="w"; this.selected=null; this.legal=[]; this.history=[]; this.lastMove=null; this.gameOver=false;
    this.historyEl.innerHTML=""; this.render(); this.updateStatus();
    this.maybeBotMove();
  }

  undo(){
    if(this.history.length===0) return;
    this.history.pop();
    // rebuild from start
    this.board=initBoard(); this.turn="w"; this.gameOver=false;
    const tempHist=[...this.history]; this.history=[];
    this.historyEl.innerHTML="";
    for(const h of tempHist){
      const {from,to,promotion} = h;
      this.makeMove(from,to,promotion,true);
      this.turn=this.turn==="w"?"b":"w";
    }
    this.selected=null; this.legal=[]; this.lastMove=tempHist.length? tempHist[tempHist.length-1] : null;
    this.render(); this.updateStatus();
  }

  makeMove(from,to,promotion=null, silent=false){
    const [fr,fc]=from, [tr,tc]=to;
    const piece=this.board[fr][fc];
    if(!piece) return false;
    // handle castling rook
    if(piece.type==="k" && Math.abs(tc-fc)===2){
      const rookFromCol = tc===6?7:0;
      const rookToCol = tc===6?5:3;
      this.board[fr][rookToCol]=this.board[fr][rookFromCol];
      this.board[fr][rookFromCol]=null;
      if(this.board[fr][rookToCol]) this.board[fr][rookToCol].hasMoved=true;
    }
    // capture
    const captured=this.board[tr][tc];
    this.board[tr][tc]=piece; this.board[fr][fc]=null;
    piece.hasMoved=true;
    // promotion
    if(piece.type==="p" && (tr===0 || tr===7)){
      if(promotion) piece.type=promotion;
      else if(!silent) { this.promptPromotion(from,to); return "promo"; }
    }
    if(!silent){
      const notation=`${String.fromCharCode(97+fc)}${8-fr} → ${String.fromCharCode(97+tc)}${8-tr}${captured?` x${INDIAN_NAME[captured.type]}`:""} ${captured?"⚔️":""}`;
      const li=document.createElement("li");
      li.textContent=`${this.history.length+1}. ${INDIAN_NAME[piece.type]} ${notation}`;
      if(captured) li.style.borderLeftColor="var(--red)";
      this.historyEl.prepend(li);
      this.history.push({from,to,captured, promotion: piece.type, notation});
      this.lastMove={from,to};
    }
    return true;
  }

  promptPromotion(from,to){
    this.promoOverlay.style.display="flex";
    this.promoChoices.innerHTML="";
    const opts=["q","r","b","n"];
    const labels={q:"Mantri ♕", r:"Hathi ♖", b:"Oont ♗", n:"Ghoda ♘"};
    opts.forEach(t=>{
      const btn=document.createElement("button");
      btn.className="gold-btn"; btn.textContent=labels[t];
      btn.addEventListener("click",()=>{
        this.promoOverlay.style.display="none";
        // find pawn at to? Actually pawn already moved, but we need to set type
        const [tr,tc]=to;
        if(this.board[tr][tc]) this.board[tr][tc].type=t;
        this.history.push({from,to,promotion:t, notation:`Promo to ${labels[t]}`});
        const li=document.createElement("li"); li.textContent=`Promote to ${INDIAN_NAME[t]} ${labels[t]}`; this.historyEl.prepend(li);
        this.turn=this.turn==="w"?"b":"w";
        this.render(); this.updateStatus(); this.maybeBotMove();
      });
      this.promoChoices.appendChild(btn);
    });
  }

  handleClick(r,c){
    if(this.gameOver) return;
    // if bot's turn and human-bot mode, ignore
    if(this.mode==="human-bot" && this.turn===this.botColor) return;
    if(this.mode==="bot-bot") return;

    const piece=this.board[r][c];
    if(this.selected){
      const [sr,sc]=this.selected;
      const isLegal=this.legal.some(([lr,lc])=>lr===r&&lc===c);
      if(isLegal){
        const res=this.makeMove([sr,sc],[r,c]);
        if(res==="promo") { this.selected=null; this.legal=[]; this.render(); return; }
        this.selected=null; this.legal=[];
        if(isCheckmate(this.board, this.turn==="w"?"b":"w")){
          this.gameOver=true; this.hintEl.textContent=`♔ Checkmate! ${this.turn==="w"?"White":"Black"} wins!`; this.turnEl.textContent=`🏆 ${this.turn==="w"?"White (Raja)":"Black"} wins by Checkmate!`;
          this.boardEl.animate([{filter:"brightness(1)"},{filter:"brightness(1.2)"}],{duration:500});
        } else if(isStalemate(this.board, this.turn==="w"?"b":"w")){
          this.gameOver=true; this.hintEl.textContent="Stalemate — draw!"; this.turnEl.textContent="🤝 Draw";
        } else {
          this.turn=this.turn==="w"?"b":"w";
        }
        this.render(); this.updateStatus(); this.maybeBotMove();
        return;
      }
      // if clicked own piece, reselect
      if(piece && piece.color===this.turn){
        this.selected=[r,c]; this.legal=legalMoves(this.board,r,c,this.turn);
        this.render(); return;
      }
      // otherwise deselect
      this.selected=null; this.legal=[]; this.render(); return;
    } else {
      if(piece && piece.color===this.turn){
        this.selected=[r,c]; this.legal=legalMoves(this.board,r,c,this.turn);
        this.render();
      }
    }
  }

  maybeBotMove(){
    if(this.gameOver) return;
    const shouldBot = (this.mode==="bot-bot") || (this.mode==="human-bot" && this.turn===this.botColor);
    if(!shouldBot) return;
    // simple greedy: capture high value if possible, else random
    setTimeout(()=>{
      if(this.gameOver) return;
      const moves=allLegalMoves(this.board, this.turn);
      if(moves.length===0) { this.updateStatus(); return; }
      // score
      const values={p:1,n:3,b:3,r:5,q:9,k:100};
      let best=moves[0], bestScore=-Infinity;
      for(const m of moves){
        const [tr,tc]=m.to;
        const target=this.board[tr][tc];
        let score=Math.random()*2;
        if(target) score+= values[target.type]*10;
        // center control
        const centerDist = Math.abs(tr-3.5)+Math.abs(tc-3.5);
        score += (7 - centerDist)*0.3;
        // check bonus
        const copy=this.board.map(row=>row.map(cell=> cell? {...cell}:null));
        const [fr,fc]=m.from; const moving=copy[fr][fc];
        copy[tr][tc]=moving; copy[fr][fc]=null;
        if(isKingInCheck(copy, this.turn==="w"?"b":"w")) score-=50; // don't leave king in check (already filtered, but safety)
        if(isKingInCheck(copy, this.turn==="w"?"b":"w" ? "w":"b")) score+=5; // give check
        if(score>bestScore){ bestScore=score; best=m; }
      }
      const [fr,fc]=best.from, [tr,tc]=best.to;
      const piece=this.board[fr][fc];
      // promotion to queen
      let promo=null;
      if(piece.type==="p" && (tr===0||tr===7)) promo="q";
      this.makeMove([fr,fc],[tr,tc],promo);
      if(isCheckmate(this.board, this.turn==="w"?"b":"w")){
        this.gameOver=true; this.turnEl.textContent=`🏆 ${this.turn==="w"?"White":"Black"} wins by Checkmate!`;
      } else if(isStalemate(this.board, this.turn==="w"?"b":"w")){
        this.gameOver=true; this.turnEl.textContent="🤝 Draw";
      } else {
        this.turn=this.turn==="w"?"b":"w";
      }
      this.render(); this.updateStatus();
      // if bot vs bot, continue
      if(this.mode==="bot-bot" && !this.gameOver) setTimeout(()=>this.maybeBotMove(), 700);
    }, 650);
  }

  render(){
    const boardEl=this.boardEl; boardEl.innerHTML="";
    for(let r=0;r<8;r++){
      for(let c=0;c<8;c++){
        const sq=document.createElement("div");
        sq.className=`chess-square ${(r+c)%2===0?"light":"dark"}`;
        sq.dataset.r=r; sq.dataset.c=c;
        // last move highlight
        if(this.lastMove && ((this.lastMove.from[0]===r&&this.lastMove.from[1]===c) || (this.lastMove.to[0]===r&&this.lastMove.to[1]===c))){
          sq.classList.add("last-move");
        }
        // selected
        if(this.selected && this.selected[0]===r && this.selected[1]===c) sq.classList.add("selected");
        // legal
        if(this.legal.some(([lr,lc])=>lr===r&&lc===c)){
          const target=this.board[r][c];
          sq.classList.add(target ? "capture" : "legal");
        }
        // check
        if(this.board[r][c]?.type==="k" && this.board[r][c].color===this.turn && isKingInCheck(this.board,this.turn)){
          sq.classList.add("in-check");
        }
        const p=this.board[r][c];
        if(p){
          const span=document.createElement("span");
          span.className=`chess-piece ${p.color==="w"?"white":"black"}`;
          span.textContent=SYMBOL[p.type][p.color];
          span.title=INDIAN_NAME[p.type];
          sq.appendChild(span);
        }
        sq.addEventListener("click",()=> this.handleClick(r,c));
        // coordinates
        if(r===7){
          const f=document.createElement("span");
          f.textContent=String.fromCharCode(97+c);
          f.style.cssText="position:absolute;bottom:2px;right:4px;font-size:10px;opacity:.6;color:#5a3a1a";
          sq.appendChild(f);
        }
        if(c===0){
          const rk=document.createElement("span");
          rk.textContent=8-r;
          rk.style.cssText="position:absolute;top:2px;left:4px;font-size:10px;opacity:.6;color:#5a3a1a";
          sq.appendChild(rk);
        }
        boardEl.appendChild(sq);
      }
    }
  }

  updateStatus(){
    if(this.gameOver) return;
    const turnName=this.turn==="w"?"White (Raja)":"Black (Raja)";
    const inCheck=isKingInCheck(this.board,this.turn);
    this.turnEl.textContent=`${this.turn==="w"?"♔":"♚"} ${turnName} to move${inCheck?" — Check! ♔":""}`;
    this.turnEl.style.color = inCheck ? "var(--red)" : "var(--ink)";
    this.hintEl.textContent = inCheck ? "King in check! Move to protect!" : "Tap a piece (Ghoda, Hathi…), then a highlighted square";
  }
}
