/* Bingo 75 western — B I N G O columns 1-15/16-30/31-45/46-60/61-75, card 5x5 free */
function genCard75(){
 const card=Array(5).fill(0).map(()=>Array(5).fill(null));
 const ranges=[[1,15],[16,30],[31,45],[46,60],[61,75]];
 for(let c=0;c<5;c++){
   const [lo,hi]=ranges[c];
   const pool=[];for(let n=lo;n<=hi;n++)pool.push(n);
   pool.sort(()=>Math.random()-0.5);
   for(let r=0;r<5;r++){if(r===2&&c===2){card[r][c]='FREE';continue} card[r][c]=pool.pop()}
 }
 return card;
}
export class Bingo75Game{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="bingo75-layout"><div class="bingo75-card"><div class="bingo75-banner">🎱 Bingo 75 <span style="opacity:.8;font-weight:400">· B I N G O · Western</span></div><div class="bingo75-caller"><div class="bingo75-ball" id="b75Ball">—</div><div style="flex:1"><div id="b75Turn" style="font-family:var(--font-display);font-weight:700;color:#7a0a0a">Press Call</div><div style="font-size:.82rem;color:#5b5175">You vs Bot — first line Bingo wins</div><div style="display:flex;gap:8px;margin-top:8px"><button id="b75Call" class="gold-btn" style="padding:8px 14px">📢 Call</button><button id="b75Auto" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#7a0a0a">▶ Auto</button><button id="b75New" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#7a0a0a">🔄 New Card</button></div></div></div><div class="bingo75-board" id="b75Board"></div><div style="font-weight:700;color:#7a0a0a;margin-bottom:6px;letter-spacing:.3em;text-align:center">B &nbsp; I &nbsp; N &nbsp; G &nbsp; O</div><div class="bingo75-card-grid" id="b75Card"></div><div id="b75Status" style="text-align:center;font-weight:700;color:#7a0a0a;margin-top:8px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>B 1-15, I 16-30, N 31-45, G 46-60, O 61-75.</div><div>Mark if on card. Line (5 in row/col/diag) = Bingo!</div><div>Very famous in Indian clubs & global.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Calls</h3><ol id="b75Log" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.ball=this.root.querySelector('#b75Ball');this.boardEl=this.root.querySelector('#b75Board');this.cardEl=this.root.querySelector('#b75Card');this.statusEl=this.root.querySelector('#b75Status');this.logEl=this.root.querySelector('#b75Log');
  this.root.querySelector('#b75Call').addEventListener('click',()=>this.call());
  this.root.querySelector('#b75Auto').addEventListener('click',e=>this.toggleAuto(e.currentTarget));
  this.root.querySelector('#b75New').addEventListener('click',()=>this.newGame());
  this.newGame();
 }
 onShow(){} onHide(){this.stopAuto()}
 newGame(){
  this.stopAuto();
  this.card=genCard75();this.called=new Set();this.recent=null;this.winner=null;this.order=[...Array(75)].map((_,i)=>i+1).sort(()=>Math.random()-0.5);
  this.marks=new Set(['FREE']);this.botCard=genCard75();this.botMarks=new Set(['FREE']);
  this.logEl.innerHTML='';this.ball.textContent='—';this.render();
 }
 render(){
  this.boardEl.innerHTML='';for(let n=1;n<=75;n++){const d=document.createElement('div');d.className='bingo75-num'+(this.called.has(n)?' called':'');d.textContent=n;this.boardEl.appendChild(d)}
  this.cardEl.innerHTML='';
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){
    const v=this.card[r][c];
    const d=document.createElement('div');d.className='bingo75-cell'+(v==='FREE'||this.marks.has(v)?' marked':'')+(v==='FREE'?' free':'');
    d.textContent=v==='FREE'?'★':v;
    this.cardEl.appendChild(d);
  }
  this.statusEl.textContent=this.winner?`🏆 ${this.winner} BINGO!`:`${this.called.size}/75 called`;
 }
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 checkBingo(marks,card){
  // rows, cols, diags, full?
  for(let r=0;r<5;r++){let ok=true;for(let c=0;c<5;c++){const v=card[r][c];if(v==='FREE')continue;if(!marks.has(v))ok=false}if(ok)return true}
  for(let c=0;c<5;c++){let ok=true;for(let r=0;r<5;r++){const v=card[r][c];if(v==='FREE')continue;if(!marks.has(v))ok=false}if(ok)return true}
  // diags
  let d1=true,d2=true;
  for(let i=0;i<5;i++){const v1=card[i][i];if(v1!=='FREE'&&!marks.has(v1))d1=false;const v2=card[i][4-i];if(v2!=='FREE'&&!marks.has(v2))d2=false}
  return d1||d2;
 }
 call(){
  if(this.winner){this.log('Game over','#ffb703');return}
  if(!this.order.length){this.log('All called','#ffb703');return}
  const n=this.order.shift();this.called.add(n);this.recent=n;this.ball.textContent=n;
  this.log(`📢 ${n}`,'#b22222');
  // mark
  for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(this.card[r][c]===n)this.marks.add(n);
  for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(this.botCard[r][c]===n)this.botMarks.add(n);
  if(this.checkBingo(this.marks,this.card)){this.winner='You';this.log('🏆 You BINGO!',' #2dc653')}
  else if(this.checkBingo(this.botMarks,this.botCard)){this.winner='Bot';this.log('🤖 Bot BINGO',' #4361ee')}
  this.render();
 }
 toggleAuto(btn){this.auto=!this.auto;btn.textContent=this.auto?'⏸ Pause':'▶ Auto';if(this.auto){this.timer=setInterval(()=>this.call(),1100)} else this.stopAuto()}
 stopAuto(){this.auto=false;clearInterval(this.timer);const b=this.root.querySelector('#b75Auto');if(b)b.textContent='▶ Auto'}
}
