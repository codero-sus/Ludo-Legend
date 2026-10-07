/* games/checkers/CheckersGame.js — Western Draughts 8x8, Vs Bot, kings */
export class CheckersGame{
  constructor(root){this.root=root;this.turn=0;this.sel=null;this.winner=null}
  init(){
    this.root.innerHTML=`<div class="checkers-layout"><div class="checkers-card"><div class="checkers-banner">♟ Checkers — Draughts <span style="opacity:.8;font-weight:400">· 8×8 · Capture to win</span></div><div class="checkers-board" id="chkBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="chkNew" class="ghost-btn" style="color:#5a3200;border-color:#c9a86a;background:#fff">🔄 New</button><button id="chkMode" class="chip-btn active">🤖 Vs Bot</button><span id="chkTurn" style="font-family:var(--font-display);font-weight:700;color:#3a2410;margin-left:8px"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔴 You (red) vs ⚫ Bot. Move diagonally 1.</div><div>✨ Capture by jumping over — must capture if possible.</div><div>👑 Reach last row to crown King (moves both ways).</div><div>🏁 No moves = lose.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="chkLog" style="max-height:200px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
    this.boardEl=this.root.querySelector('#chkBoard');this.logEl=this.root.querySelector('#chkLog');this.turnEl=this.root.querySelector('#chkTurn');
    this.root.querySelector('#chkNew').addEventListener('click',()=>this.start());
    this.modeBtn=this.root.querySelector('#chkMode');this.vsBot=true;this.modeBtn.addEventListener('click',()=>{this.vsBot=!this.vsBot;this.modeBtn.textContent=this.vsBot?'🤖 Vs Bot':'👥 2P';this.modeBtn.classList.toggle('active',this.vsBot)});
    this.start();
  }
  onShow(){} onHide(){}
  log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
  start(){
    this.board=Array(8).fill(0).map(()=>Array(8).fill(null));
    for(let r=0;r<3;r++)for(let c=0;c<8;c++)if((r+c)%2===1)this.board[r][c]={color:'black',king:false};
    for(let r=5;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1)this.board[r][c]={color:'red',king:false};
    this.turn=0;this.sel=null;this.winner=null;this.render();
  }
  render(){
    this.boardEl.innerHTML='';
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){
      const sq=document.createElement('div');sq.className='checkers-sq '+( (r+c)%2?'dark':'light');
      const p=this.board[r][c];
      if(p){
        const el=document.createElement('div');el.className='checkers-piece '+p.color+(p.king?' king':'')+(this.sel&&this.sel[0]===r&&this.sel[1]===c?' selected':'');
        el.textContent=p.king?'👑':(p.color==='red'?'🔴':'⚫');
        el.addEventListener('click',()=>this.onSelect(r,c));
        sq.appendChild(el);
      } else {
        if(this.sel){const ms=this.movesFor(this.sel[0],this.sel[1]);if(ms.some(m=>m[0]===r&&m[1]===c)){const dot=document.createElement('div');dot.className='checkers-hint';dot.innerHTML='<div class="checkers-dot"></div>';sq.appendChild(dot);}}
        sq.addEventListener('click',()=>this.onMove(r,c));
      }
      this.boardEl.appendChild(sq);
    }
    this.turnEl.textContent=this.winner?`🏆 ${this.winner} wins!`: (this.turn===0?'🔴 Your turn':'⚫ '+(this.vsBot?'Bot':'P2')+' turn');
  }
  movesFor(r,c){
    const p=this.board[r][c];if(!p)return[];
    const dirs=p.king?[-1,1]: (p.color==='red'?[-1]:[1]);
    const caps=[],moves=[];
    for(const dr of dirs){for(const dc of [-1,1]){
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&!this.board[nr][nc])moves.push([nr,nc]);
      const nr2=r+dr*2,nc2=c+dc*2,nmR=r+dr,nmC=c+dc;
      if(nr2>=0&&nr2<8&&nc2>=0&&nc2<8&&!this.board[nr2][nc2]&&this.board[nmR][nmC]&&this.board[nmR][nmC].color!==p.color)caps.push([nr2,nc2]);
    }}
    // for king also need opposite capture already covered; also need to handle non-king capture forward only
    // if any capture exists elsewhere, only captures allowed (rule) — we filter later
    return caps.length?caps:moves;
  }
  hasAnyCapture(color){
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=this.board[r][c];if(p&&p.color===color){const ms=this.movesForRawCapture(r,c);if(ms.length)return true}}
    return false;
  }
  movesForRawCapture(r,c){
    const p=this.board[r][c];if(!p)return[];
    const dirs=p.king?[-1,1]: (p.color==='red'?[-1]:[1]);
    const caps=[];
    for(const dr of dirs){for(const dc of [-1,1]){const nr2=r+dr*2,nc2=c+dc*2,nmR=r+dr,nmC=c+dc;if(nr2>=0&&nr2<8&&nc2>=0&&nc2<8&&!this.board[nr2][nc2]&&this.board[nmR][nmC]&&this.board[nmR][nmC].color!==p.color)caps.push([nr2,nc2]);}}
    return caps;
  }
  onSelect(r,c){
    const p=this.board[r][c];if(!p||this.winner)return;
    const col=this.turn===0?'red':'black';
    if(p.color!==col){if(this.vsBot&&this.turn===1)return; this.log('Not your piece','#ffb703');return}
    // enforce capture rule: if any capture, only pieces with capture selectable
    if(this.hasAnyCapture(col)){
      if(this.movesForRawCapture(r,c).length===0){this.log('Must capture!','#ef233c');return}
    }
    this.sel=[r,c];this.render();
  }
  onMove(r,c){
    if(!this.sel||this.winner)return;
    const [sr,sc]=this.sel;const p=this.board[sr][sc];
    const legal=this.movesFor(sr,sc);
    const isCap=legal.some(m=>m[0]===r&&m[1]===c)&&Math.abs(r-sr)===2;
    // capture rule enforcement: if any capture, only cap moves allowed
    const col=p.color;
    const anyCap=this.hasAnyCapture(col);
    if(anyCap&&!isCap){this.log('Must capture!','#ef233c');return}
    const found=legal.some(m=>m[0]===r&&m[1]===c);
    if(!found)return;
    // move
    this.board[r][c]=p;this.board[sr][sc]=null;
    if(isCap){const mr=(sr+r)/2,mc=(sc+c)/2;this.board[mr][mc]=null;this.log(`⚔️ ${col} captures`,'#ef233c');}
    // king
    if((p.color==='red'&&r===0)||(p.color==='black'&&r===7))p.king=true;
    this.sel=null;
    // check win
    let reds=0,blacks=0;for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){const q=this.board[rr][cc];if(q){if(q.color==='red')reds++;else blacks++;}}
    if(reds===0){this.winner='Black';this.render();return}
    if(blacks===0){this.winner='Red (You)';this.render();return}
    // check if can continue capture with same piece
    if(isCap&&this.movesForRawCapture(r,c).length){
      this.sel=[r,c];this.render(); // forced continue
      if(this.turn===1&&this.vsBot)setTimeout(()=>this.botMulti(),500);
      return;
    }
    this.turn=1-this.turn;this.render();
    if(this.winner)return;
    if(this.turn===1&&this.vsBot)setTimeout(()=>this.botMove(),600);
    // stalemate
    if(!this.hasMoves(this.turn===0?'red':'black')){this.winner=this.turn===0?'Black':'Red';this.render();}
  }
  hasMoves(col){for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=this.board[r][c];if(p&&p.color===col&&this.movesFor(r,c).length)return true}return false}
  botMove(){
    if(this.winner||this.turn!==1)return;
    const col='black';
    let choices=[];
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=this.board[r][c];if(p&&p.color===col){const ms=this.movesFor(r,c).filter(m=>{const anyCap=this.hasAnyCapture(col);const isCap=Math.abs(m[0]-r)===2;return !anyCap||isCap});ms.forEach(m=>choices.push({r,c,m}))}}
    if(!choices.length){this.winner='Red (You)';this.render();return}
    // prefer capture
    const caps=choices.filter(ch=>Math.abs(ch.m[0]-ch.r)===2);
    const pick=(caps.length?caps:choices)[Math.floor(Math.random()*(caps.length||choices.length))];
    this.sel=[pick.r,pick.c];this.render();
    setTimeout(()=>this.onMove(pick.m[0],pick.m[1]),280);
  }
  botMulti(){ // continue capture
    if(!this.sel)return;
    const ms=this.movesForRawCapture(this.sel[0],this.sel[1]);if(ms.length){const m=ms[Math.floor(Math.random()*ms.length)];this.onMove(m[0],m[1])}
  }
}
