/* Tic Tac Toe 3x3 — Vs Bot (minimax lite) */
export class TicTacToeGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="tictactoe-layout"><div class="tictactoe-card"><div class="tictactoe-banner">❌ Tic Tac Toe <span style="opacity:.8;font-weight:400">· 3×3 · First to line</span></div><div class="tictactoe-board" id="tttBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="tttNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button><button id="tttMode" class="chip-btn active">🤖 Vs Bot</button><span id="tttTurn" style="font-weight:700;color:#5a3200;margin-left:8px"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">🏆 Score</h3><div id="tttScore" style="font-size:1.2rem;font-weight:800;color:var(--gold)"></div><div style="font-size:.82rem;color:rgba(255,255,255,.8);margin-top:6px">You = ❌, Bot = ⭕. 3 in row wins.</div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="tttLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#tttBoard');this.turnEl=this.root.querySelector('#tttTurn');this.logEl=this.root.querySelector('#tttLog');this.scoreEl=this.root.querySelector('#tttScore');
  this.scores={you:0,bot:0,draw:0};this.vsBot=true;
  this.root.querySelector('#tttNew').addEventListener('click',()=>this.start());
  this.root.querySelector('#tttMode').addEventListener('click',e=>{this.vsBot=!this.vsBot;e.currentTarget.textContent=this.vsBot?'🤖 Vs Bot':'👥 2P';e.currentTarget.classList.toggle('active',this.vsBot)});
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.cells=Array(9).fill('');this.turn='X';this.winner=null;this.winLine=null;this.render()}
 render(){
  this.boardEl.innerHTML='';
  this.cells.forEach((v,i)=>{
    const d=document.createElement('div');d.className='tictactoe-cell'+(v?' '+v.toLowerCase():'')+(this.winLine&&this.winLine.includes(i)?' win':'');
    d.textContent=v==='X'?'❌':v==='O'?'⭕':'';
    d.addEventListener('click',()=>this.move(i));
    this.boardEl.appendChild(d);
  });
  this.turnEl.textContent=this.winner?`🏆 ${this.winner}`:(this.turn==='X'?'❌ Your turn':'⭕ '+(this.vsBot?'Bot':'P2')+' turn');
  this.scoreEl.textContent=`You ${this.scores.you} — ${this.scores.bot} Bot — ${this.scores.draw} Draw`;
 }
 winCheck(b=this.cells){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const l of lines){const [a,b1,c]=l;if(b[a]&&b[a]===b[b1]&&b[a]===b[c])return {winner:b[a],line:l}}
  if(b.every(v=>v))return {winner:'draw',line:null}
  return null;
 }
 move(i){
  if(this.winner||this.cells[i])return;
  const isBotTurn=this.vsBot&&this.turn==='O';
  if(isBotTurn)return;
  this.cells[i]=this.turn;
  const res=this.winCheck();
  if(res){this.finish(res);return}
  this.turn=this.turn==='X'?'O':'X';
  this.render();
  if(this.vsBot&&this.turn==='O')setTimeout(()=>this.bot(),400);
 }
 finish(res){
  if(res.winner==='draw'){this.winner='Draw';this.scores.draw++;this.log('🤝 Draw','#ffb703');}
  else {this.winner=(res.winner==='X'?'You (❌)':'Bot (⭕)')+' wins!'; if(res.winner==='X')this.scores.you++; else this.scores.bot++; this.winLine=res.line; this.log(`🏆 ${this.winner}`,'#2dc653');}
  this.render();
 }
 bot(){
  if(this.winner)return;
  // simple: win > block > center > random
  const empties=this.cells.map((v,i)=>v?'':i).filter(v=>v!=='');
  // try win
  for(const i of empties){const copy=[...this.cells];copy[i]='O';if(this.winCheck(copy)?.winner==='O'){this.cells[i]='O';const r=this.winCheck();if(r)this.finish(r);else{this.turn='X';this.render();}return}}
  for(const i of empties){const copy=[...this.cells];copy[i]='X';if(this.winCheck(copy)?.winner==='X'){this.cells[i]='O';const r=this.winCheck();if(r)this.finish(r);else{this.turn='X';this.render();}return}}
  let pick=empties.includes(4)?4:empties[Math.floor(Math.random()*empties.length)];
  this.cells[pick]='O';
  const r=this.winCheck();if(r)this.finish(r);else{this.turn='X';this.render();}
 }
}
