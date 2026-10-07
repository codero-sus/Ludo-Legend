/* Battleship 10x10 — Vs Bot, 5 ships, hunt */
export class BattleshipGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="battleship-layout"><div class="battleship-card"><div class="battleship-banner">🚢 Battleship <span style="opacity:.8;font-weight:400">· 10×10 · Sink fleet</span></div><div class="battleship-boards"><div><div style="font-weight:700;color:#1a3a5a;text-align:center;margin-bottom:6px">Your Fleet (auto)</div><div class="battleship-grid" id="bsOwn"></div></div><div><div style="font-weight:700;color:#b22222;text-align:center;margin-bottom:6px">Enemy Waters — Click to fire</div><div class="battleship-grid" id="bsEnemy"></div></div></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="bsNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New Battle</button><span id="bsStatus" style="font-weight:700;color:#1a3a5a"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>5 ships: 5,4,3,3,2 cells. You vs Bot.</div><div>🔴 Hit — ⚪ Miss. Sink all 5 to win.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="bsLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.ownEl=this.root.querySelector('#bsOwn');this.enemyEl=this.root.querySelector('#bsEnemy');this.statusEl=this.root.querySelector('#bsStatus');this.logEl=this.root.querySelector('#bsLog');
  this.root.querySelector('#bsNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 randomShips(){
  const board=Array(10).fill(0).map(()=>Array(10).fill(0));
  const ships=[5,4,3,3,2];
  for(const len of ships){
    let placed=false;let tries=0;
    while(!placed&&tries<200){tries++;const r=Math.floor(Math.random()*10),c=Math.floor(Math.random()*10),dir=Math.random()<0.5?'h':'v';
      if(dir==='h'&&c+len>10)continue;if(dir==='v'&&r+len>10)continue;
      let ok=true;for(let k=0;k<len;k++){const nr=dir==='h'?r:r+k,nc=dir==='h'?c+k:c;if(board[nr][nc])ok=false;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const ar=nr+dr,ac=nc+dc;if(ar>=0&&ar<10&&ac>=0&&ac<10&&board[ar][ac]){if(!(dr===0&&dc===0))ok=false}}}
      if(!ok)continue;
      for(let k=0;k<len;k++)board[dir==='h'?r:r+k][dir==='h'?c+k:c]=len;
      placed=true;
    }
  }
  return board;
 }
 start(){
  this.own=this.randomShips();this.enemy=this.randomShips();
  this.ownHits=Array(10).fill(0).map(()=>Array(10).fill(''));
  this.enemyHits=Array(10).fill(0).map(()=>Array(10).fill(''));
  this.turn='you';this.winner=null;this.render();
 }
 render(){
  this.ownEl.innerHTML='';this.enemyEl.innerHTML='';
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){
    const cell=document.createElement('div');cell.className='battleship-cell';
    const has=this.own[r][c]? 'ship':'';
    const hit=this.ownHits[r][c];
    if(hit==='hit')cell.classList.add('hit');else if(hit==='miss')cell.classList.add('miss');else if(has)cell.classList.add('ship');
    cell.textContent= hit==='hit'?'💥': hit==='miss'?'·': has?'■':'';
    this.ownEl.appendChild(cell);
  }
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){
    const cell=document.createElement('div');cell.className='battleship-cell';
    const hit=this.enemyHits[r][c];
    if(hit==='hit')cell.classList.add('hit');else if(hit==='miss')cell.classList.add('miss');
    cell.textContent= hit==='hit'?'💥': hit==='miss'?'·':'';
    cell.addEventListener('click',()=>this.fire(r,c));
    this.enemyEl.appendChild(cell);
  }
  const ownRemain=this.enemy.flat().filter(v=>v).length - this.enemyHits.flat().filter(v=>v==='hit').length;
  const enemyRemain=this.own.flat().filter(v=>v).length - this.ownHits.flat().filter(v=>v==='hit').length;
  this.statusEl.textContent=this.winner?`🏆 ${this.winner}`:`Enemy ships left ${ownRemain} · Your ships left ${enemyRemain}` + (this.turn==='you'?' — Your turn':' — Bot turn');
 }
 fire(r,c){
  if(this.winner||this.turn!=='you')return;
  if(this.enemyHits[r][c]){this.log('Already fired','#ffb703');return}
  if(this.enemy[r][c]){this.enemyHits[r][c]='hit';this.log(`💥 Hit at ${String.fromCharCode(65+c)}${r+1}!`,'#ef233c');}
  else {this.enemyHits[r][c]='miss';this.log(`· Miss ${String.fromCharCode(65+c)}${r+1}`,'#5a6a7a');}
  // check win
  if(this.enemy.flat().filter(v=>v).length===this.enemyHits.flat().filter(v=>v==='hit').length){this.winner='You';this.render();this.log('🏆 Fleet sunk! You win!','#2dc653');return}
  this.turn='bot';this.render();setTimeout(()=>this.botFire(),700);
 }
 botFire(){
  if(this.winner)return;
  let r,c;do{r=Math.floor(Math.random()*10);c=Math.floor(Math.random()*10)}while(this.ownHits[r][c]);
  if(this.own[r][c]){this.ownHits[r][c]='hit';this.log(`💥 Bot hits your ${String.fromCharCode(65+c)}${r+1}`,'#ef233c');}
  else {this.ownHits[r][c]='miss';this.log(`· Bot misses ${String.fromCharCode(65+c)}${r+1}`,'#5a6a7a');}
  if(this.own.flat().filter(v=>v).length===this.ownHits.flat().filter(v=>v==='hit').length){this.winner='Bot';this.render();this.log('💥 Your fleet sunk!','#ef233c');return}
  this.turn='you';this.render();
 }
}
