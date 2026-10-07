/* Connect Four 7x6 — Vs Bot, 4-in-row */
export class Connect4Game{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="connect4-layout"><div class="connect4-card"><div class="connect4-banner">🔴 Connect Four <span style="opacity:.9;font-weight:400">· 7×6 · Drop to connect</span></div><div class="connect4-board" id="c4Board"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center"><button id="c4New" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button><span id="c4Turn" style="font-weight:700;color:#1a2e9a"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔴 You vs 🟡 Bot. Click column to drop.</div><div>🎯 4 in row (h/v/d) wins.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="c4Log" style="max-height:200px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#c4Board');this.turnEl=this.root.querySelector('#c4Turn');this.logEl=this.root.querySelector('#c4Log');
  this.root.querySelector('#c4New').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 start(){this.grid=Array(6).fill(0).map(()=>Array(7).fill(''));this.turn='red';this.winner=null;this.render()}
 render(){
  this.boardEl.innerHTML='';
  for(let c=0;c<7;c++){
    const col=document.createElement('div');col.className='connect4-col';col.addEventListener('click',()=>this.drop(c));
    for(let r=0;r<6;r++){
      const cell=document.createElement('div');cell.className='connect4-cell'+(this.grid[r][c]?` ${this.grid[r][c]}`:'');
      if(this.winner&&this.winCells&&this.winCells.some(p=>p[0]===r&&p[1]===c))cell.classList.add('win');
      col.appendChild(cell);
    }
    this.boardEl.appendChild(col);
  }
  this.turnEl.textContent=this.winner?`🏆 ${this.winner}`:(this.turn==='red'?'🔴 Your turn':'🟡 Bot turn');
 }
 drop(col){
  if(this.winner)return;
  if(this.turn==='yellow')return;
  let row=-1;for(let r=5;r>=0;r--)if(!this.grid[r][col]){row=r;break}
  if(row===-1){this.log('Column full','#ffb703');return}
  this.grid[row][col]=this.turn;
  this.log(`${this.turn==='red'?'🔴':'🟡'} col ${col+1}`,'#4361ee');
  const w=this.checkWin();if(w){this.winner=w.winner==='red'?'You (🔴) wins!':'Bot (🟡) wins!';this.winCells=w.cells;this.render();return}
  if(this.grid.flat().every(v=>v)){this.winner='Draw';this.render();return}
  this.turn='yellow';this.render();setTimeout(()=>this.bot(),600);
 }
 checkWin(){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<6;r++)for(let c=0;c<7;c++){const col=this.grid[r][c];if(!col)continue;for(const [dr,dc] of dirs){const cells=[[r,c]];for(let k=1;k<4;k++){const nr=r+dr*k,nc=c+dc*k;if(nr>=0&&nr<6&&nc>=0&&nc<7&&this.grid[nr][nc]===col)cells.push([nr,nc]);else break}if(cells.length===4)return {winner:col,cells}}}
  return null;
 }
 bot(){
  if(this.winner)return;
  // try win/block
  for(const col of [3,2,4,1,5,0,6]){
    let r=-1;for(let rr=5;rr>=0;rr--)if(!this.grid[rr][col]){r=rr;break}if(r===-1)continue;
    this.grid[r][col]='yellow';if(this.checkWin()?.winner==='yellow'){this.log(`🟡 Bot drops col ${col+1} (win)`,'#ffb703');const w=this.checkWin();this.winner='Bot (🟡) wins!';this.winCells=w.cells;this.render();return}this.grid[r][col]='';
  }
  for(const col of [3,2,4,1,5,0,6]){
    let r=-1;for(let rr=5;rr>=0;rr--)if(!this.grid[rr][col]){r=rr;break}if(r===-1)continue;
    this.grid[r][col]='red';if(this.checkWin()?.winner==='red'){this.grid[r][col]='yellow';this.log(`🟡 Bot blocks col ${col+1}`,'#2dc653');const w=this.checkWin();if(w){this.winner='Bot (🟡) wins!';this.winCells=w.cells} else this.turn='red';this.render();return}this.grid[r][col]='';
  }
  const order=[3,2,4,1,5,0,6];for(const col of order){let r=-1;for(let rr=5;rr>=0;rr--)if(!this.grid[rr][col]){r=rr;break}if(r!==-1){this.grid[r][col]='yellow';this.log(`🟡 Bot col ${col+1}`,'#ffb703');const w=this.checkWin();if(w){this.winner='Bot (🟡) wins!';this.winCells=w.cells} else if(this.grid.flat().every(v=>v))this.winner='Draw'; else this.turn='red';this.render();return}}
 }
}
