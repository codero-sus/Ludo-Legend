/* Go 9x9 — place stones, capture surrounded, Vs Bot */
export class GoGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="go-layout"><div class="go-card"><div class="go-banner">⚫ Go — 9×9 <span style="opacity:.8;font-weight:400">· Surround to capture</span></div><div class="go-board" id="goBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="goPass" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#3a2410">Pass</button><button id="goNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#3a2410">🔄 New</button><span id="goTurn" style="font-weight:700;color:#3a2410"></span><span id="goScore" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Black (You) vs White Bot. Place stone on intersection.</div><div>Surrounded group (no liberties) is captured.</div><div>Suicide illegal. Pass twice ends game — most captures wins.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="goLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#goBoard');this.turnEl=this.root.querySelector('#goTurn');this.scoreEl=this.root.querySelector('#goScore');this.logEl=this.root.querySelector('#goLog');
  this.root.querySelector('#goPass').addEventListener('click',()=>this.pass());
  this.root.querySelector('#goNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 start(){
  this.board=Array(9).fill(0).map(()=>Array(9).fill(null));
  this.turn='black';this.captures={black:0,white:0};this.passes=0;this.winner=null;
  this.render();
 }
 render(){
  this.boardEl.innerHTML='';
  // grid lines
  for(let i=0;i<9;i++){
    const h=document.createElement('div');h.className='go-lineH';h.style.top=`${18 + i*((100-36)/8)}%`;this.boardEl.appendChild(h);
    const v=document.createElement('div');v.className='go-lineV';v.style.left=`${18 + i*((100-36)/8)}%`;this.boardEl.appendChild(v);
  }
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    const pt=document.createElement('div');pt.className='go-point';
    const v=this.board[r][c];
    if(v){const s=document.createElement('div');s.className='go-stone '+v;pt.appendChild(s);}
    pt.addEventListener('click',()=>this.place(r,c));
    this.boardEl.appendChild(pt);
  }
  this.turnEl.textContent=this.winner?`🏆 ${this.winner}`:(this.turn==='black'?'⚫ Your turn (Black)':'⚪ Bot (White)');
  this.scoreEl.textContent=`Captures You ${this.captures.black} — Bot ${this.captures.white}`;
 }
 neighbors(r,c){return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc])=>nr>=0&&nr<9&&nc>=0&&nc<9)}
 group(r,c,visited=new Set()){
  const col=this.board[r][c];if(!col)return {stones:[],libs:new Set()};
  const key=`${r},${c}`;if(visited.has(key))return {stones:[],libs:new Set()};
  visited.add(key);
  let stones=[[r,c]];let libs=new Set();
  for(const [nr,nc] of this.neighbors(r,c)){
    if(!this.board[nr][nc])libs.add(`${nr},${nc}`);
    else if(this.board[nr][nc]===col){const res=this.group(nr,nc,visited);stones=stones.concat(res.stones);res.libs.forEach(l=>libs.add(l))}
  }
  return {stones, libs};
 }
 place(r,c){
  if(this.winner||this.board[r][c])return;
  if(this.turn==='white')return;
  const col='black';
  this.board[r][c]=col;
  // capture opponent
  let captured=0;
  for(const [nr,nc] of this.neighbors(r,c)){
    if(this.board[nr][nc]&&this.board[nr][nc]!==col){
      const g=this.group(nr,nc);
      if(g.libs.size===0){g.stones.forEach(([gr,gc])=>{this.board[gr][gc]=null;captured++})}
    }
  }
  // suicide check (if own group no liberties and no capture)
  const own=this.group(r,c);
  if(own.libs.size===0&&captured===0){this.board[r][c]=null;this.log('Suicide illegal','#ef233c');return}
  this.captures.black+=captured;
  if(captured) this.log(`⚔️ You capture ${captured}`,'#2dc653');
  this.passes=0;
  this.turn='white';this.render();
  if(this.checkEnd())return;
  setTimeout(()=>this.bot(),600);
 }
 bot(){
  if(this.winner||this.turn!=='white')return;
  // simple: random empty with liberties, prefer capture
  const empties=[];for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!this.board[r][c])empties.push([r,c]);
  empties.sort(()=>Math.random()-0.5);
  for(const [r,c] of empties){
    // simulate
    this.board[r][c]='white';
    let caps=0;let suicide=false;
    for(const [nr,nc] of this.neighbors(r,c)){
      if(this.board[nr][nc]==='black'){
        const g=this.group(nr,nc);
        if(g.libs.size===0) caps+=g.stones.length;
      }
    }
    const own=this.group(r,c);
    if(own.libs.size===0&&caps===0) suicide=true;
    this.board[r][c]=null;
    if(suicide) continue;
    if(caps>0){
      // play capturing move
      this.board[r][c]='white';
      let captured=0;
      for(const [nr,nc] of this.neighbors(r,c)){
        if(this.board[nr][nc]==='black'){
          const g=this.group(nr,nc);
          if(g.libs.size===0){g.stones.forEach(([gr,gc])=>{this.board[gr][gc]=null;captured++})}
        }
      }
      this.captures.white+=captured;
      this.log(`🤖 Bot captures ${captured} at ${r+1},${c+1}`,'#4361ee');
      this.turn='black';this.passes=0;this.render();this.checkEnd();return;
    }
  }
  // no capture, random
  if(empties.length){
    const [r,c]=empties[0];
    this.board[r][c]='white';
    const own=this.group(r,c);
    if(own.libs.size===0){this.board[r][c]=null; this.pass();return}
    this.log(`⚪ Bot at ${r+1},${c+1}`,'#4361ee');
    this.turn='black';this.passes=0;this.render();this.checkEnd();
  } else this.pass();
 }
 pass(){
  this.passes++;this.log(`${this.turn==='black'?'You':'Bot'} pass`,'#ffb703');
  if(this.passes>=2){this.endGame();return}
  this.turn=this.turn==='black'?'white':'black';this.render();
  if(this.turn==='white')setTimeout(()=>this.bot(),600);
 }
 checkEnd(){
  const empty=this.board.flat().filter(v=>!v).length;
  if(empty===0){this.endGame();return true}
  return false;
 }
 endGame(){
  this.winner= this.captures.black>this.captures.white ? 'You (Black)' : this.captures.white>this.captures.black ? 'Bot (White)' : 'Draw';
  this.log(`🏁 Game over — ${this.winner} wins`,'#ffd166');this.render();
 }
}
