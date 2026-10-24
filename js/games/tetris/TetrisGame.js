/* Tetris 10x20 — 7 tetrominoes, line clear, Vs Score */
const SHAPES={
 I:[[1,1,1,1]],
 O:[[1,1],[1,1]],
 T:[[0,1,0],[1,1,1]],
 S:[[0,1,1],[1,1,0]],
 Z:[[1,1,0],[0,1,1]],
 J:[[1,0,0],[1,1,1]],
 L:[[0,0,1],[1,1,1]]
};
const COLORS={I:'#00f0f0',O:'#f0f000',T:'#a000f0',S:'#00f000',Z:'#f00000',J:'#0000f0',L:'#f0a000'};
export class TetrisGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="tetris-layout"><div class="tetris-card"><div class="tetris-banner">🧱 Tetris <span style="opacity:.8;font-weight:400">· 10×20 · Stack & clear</span></div><div style="display:flex;gap:12px;justify-content:center;align-items:flex-start"><div class="tetris-well" id="tetWell"></div><div style="display:flex;flex-direction:column;gap:8px;align-items:center"><div style="font-weight:700;color:#5a3200">Next</div><div class="tetris-preview" id="tetNext"></div><div id="tetScore" style="font-weight:800;color:#7209b7;background:#fff;border-radius:8px;padding:6px 10px;border:2px solid #c9a86a"></div><div id="tetLines" style="font-weight:700;color:#5a3200"></div><button id="tetNew" class="gold-btn" style="padding:8px 14px">🔄 New</button><button id="tetPause" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">⏸ Pause</button></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px"><button data-act="left" class="chip-btn tet-btn">⬅</button><button data-act="rotate" class="chip-btn tet-btn">↻</button><button data-act="right" class="chip-btn tet-btn">➡</button><button data-act="down" class="chip-btn tet-btn">⬇</button><button data-act="drop" class="chip-btn tet-btn">⬇⬇</button><button data-act="pause" class="chip-btn tet-btn">⏸</button></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">🎮 Controls</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>⬅➡ Move, ⬇ Soft, Space/Hard Drop, ↻ Rotate.</div><div>Clear lines to score. Very famous global arcade!</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="tetLog" style="max-height:160px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#tetrisBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='tetrisBotToggle';
    btn.textContent='🤖 Play with Bot: ON';
    btn.className='chip-btn active';
    btn.style.margin='6px';
    btn.style.border='1px solid #c9a86a';
    btn.addEventListener('click',()=>{
      this.vsBot=!this.vsBot;
      btn.textContent=this.vsBot?'🤖 Play with Bot: ON':'👤 Play Solo';
      btn.classList.toggle('active',this.vsBot);
      try{this.log(this.vsBot?'🤖 Bot enabled — bot will auto-play!':'👤 Solo mode','#4361ee')}catch{}
      if(this.vsBot) this._triggerBot();
    });
    const container=this.root.querySelector('.tetris-controls')||this.root.querySelector('.tetris-card')||this.root.querySelector('.panel-block')||this.root;
    container.appendChild(btn);
  };
  setTimeout(_createBotToggle, 80);
  this._triggerBot = () => {
    if(!this.vsBot) return;
    clearTimeout(this._botTimer);
    this._botTimer = setTimeout(()=>{
      try{
        if(typeof this.botMove==='function'){ this.botMove(); }
        else if(typeof this.botPlay==='function'){ this.botPlay(); }
        else {
          // Generic bot: find a clickable element and click it
          const candidates = Array.from(this.root.querySelectorAll('button, [data-idx], .sudoku-cell, .memory-tile, .wordmatch-cell, .tictactoe-cell, .dotsboxes-cell, .crossword-cell, .cricket-btn, .football-btn'));
          const avail = candidates.filter(el=> !el.disabled && !el.classList.contains('matched') && el.offsetParent!==null);
          // Filter to not include the bot toggle itself
          const filtered = avail.filter(el=> el.id!== 'tetrisBotToggle' && !el.textContent.includes('Play with Bot'));
          if(filtered.length){
            const pick = filtered[Math.floor(Math.random()*filtered.length)];
            pick.click();
            try{this.log('🤖 Bot played','#4361ee')}catch{}
          }
        }
      }catch(e){ console.log('bot error',e)}
    }, 800);
  };
  // Hook to auto-trigger bot after player actions: wrap log or call _triggerBot after moves
  const _origLog = this.log?.bind(this);

  this.wellEl=this.root.querySelector('#tetWell');this.nextEl=this.root.querySelector('#tetNext');this.scoreEl=this.root.querySelector('#tetScore');this.linesEl=this.root.querySelector('#tetLines');this.logEl=this.root.querySelector('#tetLog');
  this.root.querySelector('#tetNew').addEventListener('click',()=>this.start());
  this.root.querySelector('#tetPause').addEventListener('click',()=>this.toggle());
  this.root.querySelectorAll('.tet-btn').forEach(b=>b.addEventListener('click',()=>this.action(b.dataset.act)));
  this.keyHandler=e=>{
    if(!this.root.classList.contains('active')||this.paused||this.over)return;
    const m={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',Space:'drop',KeyP:'pause'}[e.code];
    if(m){e.preventDefault();this.action(m)}
  };
  window.addEventListener('keydown',this.keyHandler);
  this.start();
 }
 onShow(){this.paused=false} onHide(){this.paused=true}
 log(m){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';this.logEl.prepend(li);while(this.logEl.children.length>8)this.logEl.lastChild.remove()}
 start(){
  this.grid=Array(20).fill(0).map(()=>Array(10).fill(''));
  this.score=0;this.lines=0;this.over=false;this.paused=false;
  this.bag=[];this.nextShape=this.randShape();
  this.spawn();
  this.render();
  clearInterval(this.timer);this.timer=setInterval(()=>{if(!this.paused&&!this.over)this.action('down')},520);
 }
 randShape(){if(!this.bag.length)this.bag=Object.keys(SHAPES).sort(()=>Math.random()-0.5);return this.bag.pop()}
 spawn(){
  const name=this.nextShape; this.nextShape=this.randShape();
  this.cur={name,shape:SHAPES[name].map(r=>[...r]),x:3,y:0};
  if(this.collision(this.cur.shape,this.cur.x,this.cur.y)){this.over=true;this.log('💀 Game Over');}
 }
 collision(shape,x,y){
  for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){
    const nr=y+r,nc=x+c;
    if(nc<0||nc>=10||nr>=20)return true;
    if(nr>=0&&this.grid[nr][nc])return true;
  }
  return false;
 }
 merge(){
  for(let r=0;r<this.cur.shape.length;r++)for(let c=0;c<this.cur.shape[r].length;c++)if(this.cur.shape[r][c]){
    const nr=this.cur.y+r,nc=this.cur.x+c;
    if(nr>=0) this.grid[nr][nc]=this.cur.name;
  }
  // clear lines
  let cleared=0;
  for(let r=19;r>=0;r--){
    if(this.grid[r].every(v=>v)){
      this.grid.splice(r,1);this.grid.unshift(Array(10).fill(''));cleared++;r++;
    }
  }
  if(cleared){this.lines+=cleared;this.score+= cleared*100 + (cleared===4?400:0); this.log(`✨ ${cleared} line${cleared>1?'s':''} cleared`);}
 }
 render(){
  this.wellEl.innerHTML='';
  // draw grid + cur
  const display=this.grid.map(r=>[...r]);
  if(this.cur&&!this.over){
    for(let r=0;r<this.cur.shape.length;r++)for(let c=0;c<this.cur.shape[r].length;c++)if(this.cur.shape[r][c]){
      const nr=this.cur.y+r,nc=this.cur.x+c;
      if(nr>=0&&nr<20&&nc>=0&&nc<10) display[nr][nc]=this.cur.name;
    }
  }
  for(let r=0;r<20;r++)for(let c=0;c<10;c++){
    const cell=document.createElement('div');cell.className='tetris-cell'+(display[r][c]?' filled':'');
    if(display[r][c])cell.style.background=COLORS[display[r][c]];
    this.wellEl.appendChild(cell);
  }
  // next
  this.nextEl.innerHTML='';
  const ns=SHAPES[this.nextShape];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const d=document.createElement('div');d.style.borderRadius='2px';
    if(ns[r]&&ns[r][c])d.style.background=COLORS[this.nextShape]; else d.style.background='transparent';
    this.nextEl.appendChild(d);
  }
  this.scoreEl.textContent=`Score ${this.score}`;
  this.linesEl.textContent=`Lines ${this.lines}`;
 }
 action(act){
  if(this.over)return;
  if(act==='pause'){this.toggle();return}
  if(this.paused)return;
  if(act==='left'){if(!this.collision(this.cur.shape,this.cur.x-1,this.cur.y))this.cur.x--}
  else if(act==='right'){if(!this.collision(this.cur.shape,this.cur.x+1,this.cur.y))this.cur.x++}
  else if(act==='down'){
    if(!this.collision(this.cur.shape,this.cur.x,this.cur.y+1))this.cur.y++;
    else {this.merge();this.spawn()}
  }
  else if(act==='drop'){
    while(!this.collision(this.cur.shape,this.cur.x,this.cur.y+1))this.cur.y++;
    this.merge();this.spawn();
  }
  else if(act==='rotate'){
    const rot=this.cur.shape[0].map((_,i)=>this.cur.shape.map(row=>row[i]).reverse());
    if(!this.collision(rot,this.cur.x,this.cur.y))this.cur.shape=rot;
  }
  this.render();
 }
 toggle(){this.paused=!this.paused; this.log(this.paused?'⏸ Paused':'▶ Resumed')}
}
