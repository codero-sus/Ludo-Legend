/* Reversi / Othello 8x8 — Vs Bot, flipping */
export class ReversiGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="reversi-layout"><div class="reversi-card"><div class="reversi-banner">⚫ Reversi — Othello <span style="opacity:.8;font-weight:400">· 8×8 · Flip to win</span></div><div class="reversi-board" id="revBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center"><button id="revNew" class="ghost-btn" style="color:#0a4d2a;background:#fff;border-color:#c9a86a">🔄 New</button><span id="revScore" style="font-weight:800;color:#5a3200"></span><span id="revTurn" style="font-family:var(--font-display);font-weight:700;color:#0a4d2a"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>⚫ You = Black vs ⚪ Bot. Place to outflank.</div><div>↔️ Flips all bracketed lines (8 dirs).</div><div>🎯 Most discs at end wins. Pass if no move.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="revLog" style="max-height:200px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#revBoard');this.logEl=this.root.querySelector('#revLog');this.scoreEl=this.root.querySelector('#revScore');this.turnEl=this.root.querySelector('#revTurn');
  this.root.querySelector('#revNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 start(){
  this.board=Array(8).fill(0).map(()=>Array(8).fill(null));
  this.board[3][3]='white';this.board[3][4]='black';this.board[4][3]='black';this.board[4][4]='white';
  this.turn='black';this.winner=null;this.render();
 }
 render(){
  this.boardEl.innerHTML='';
  let bc=0,wc=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(this.board[r][c]==='black')bc++;if(this.board[r][c]==='white')wc++;}
  this.scoreEl.textContent=`⚫ ${bc} — ${wc} ⚪`;
  if(this.winner){this.turnEl.textContent=`🏆 ${this.winner} wins!`; } else this.turnEl.textContent=this.turn==='black'?'⚫ Your turn':'⚪ Bot turn';
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const sq=document.createElement('div');sq.className='reversi-sq';
    const v=this.board[r][c];
    if(v){const d=document.createElement('div');d.className='reversi-disc '+v;sq.appendChild(d);}
    else {
      const flips=this.flips(r,c,this.turn);
      if(flips.length)sq.classList.add('legal');
      sq.addEventListener('click',()=>this.place(r,c));
    }
    this.boardEl.appendChild(sq);
  }
 }
 dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
 flips(r,c,col){
  if(this.board[r][c])return[];
  const opp=col==='black'?'white':'black';
  const out=[];
  for(const [dr,dc] of this.dirs){
    let nr=r+dr,nc=c+dc,path=[];
    while(nr>=0&&nr<8&&nc>=0&&nc<8&&this.board[nr][nc]===opp){path.push([nr,nc]);nr+=dr;nc+=dc;}
    if(path.length&&nr>=0&&nr<8&&nc>=0&&nc<8&&this.board[nr][nc]===col)out.push(...path);
  }
  return out;
 }
 hasMove(col){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(!this.board[r][c]&&this.flips(r,c,col).length)return true;return false}
 place(r,c){
  if(this.winner)return;
  if(this.turn==='white')return; // bot
  const f=this.flips(r,c,this.turn);if(!f.length){this.log('Illegal','#ef233c');return}
  this.board[r][c]=this.turn;f.forEach(([fr,fc])=>this.board[fr][fc]=this.turn);
  this.log(`⚫ You at ${String.fromCharCode(65+c)}${r+1}`,'#111');
  this.next();
 }
 next(){
  // check end
  const empty=this.board.flat().filter(v=>!v).length;
  if(empty===0||(!this.hasMove('black')&&!this.hasMove('white'))){
    let bc=0,wc=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(this.board[r][c]==='black')bc++;if(this.board[r][c]==='white')wc++;}
    this.winner= bc>wc?'Black (You)': wc>bc?'White (Bot)':'Draw';this.render();this.log(`🏁 ${this.winner} wins!`,'#ffd166');return;
  }
  this.turn=this.turn==='black'?'white':'black';
  if(!this.hasMove(this.turn)){
    this.log(`${this.turn} has no move — pass`,'#ffb703');
    this.turn=this.turn==='black'?'white':'black';
    if(!this.hasMove(this.turn)){let bc=0,wc=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(this.board[r][c]==='black')bc++;if(this.board[r][c]==='white')wc++;}this.winner= bc>wc?'Black (You)': wc>bc?'White (Bot)':'Draw';this.render();return}
  }
  this.render();
  if(this.turn==='white')setTimeout(()=>this.bot(),600);
 }
 bot(){
  if(this.winner||this.turn!=='white')return;
  const moves=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(!this.board[r][c]){const f=this.flips(r,c,'white');if(f.length)moves.push({r,c,f})}
  if(!moves.length){this.next();return}
  moves.sort((a,b)=>b.f.length-a.f.length);
  // prefer corners
  const corner=moves.find(m=>(m.r===0||m.r===7)&&(m.c===0||m.c===7));
  const pick=corner||moves[0];
  this.board[pick.r][pick.c]='white';pick.f.forEach(([fr,fc])=>this.board[fr][fc]='white');
  this.log(`⚪ Bot at ${String.fromCharCode(65+pick.c)}${pick.r+1} flips ${pick.f.length}`,'#4361ee');
  this.next();
 }
}
