/* Minesweeper 9x9 10 mines — click, flag, auto-reveal */
export class MinesweeperGame{
 constructor(root){this.root=root;this.w=9;this.h=9;this.mines=10}
 init(){
  this.root.innerHTML=`<div class="minesweeper-layout"><div class="minesweeper-card"><div class="minesweeper-banner">💣 Minesweeper <span style="opacity:.8;font-weight:400">· 9×9 · 10 mines</span></div><div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:8px"><span id="mineCount" style="font-weight:800;color:#b22222"></span><button id="mineNew" class="gold-btn" style="padding:8px 14px">🔄 New</button><span id="mineStatus" style="font-weight:700;color:#5a3200"></span></div><div class="minesweeper-board" id="mineBoard"></div><div style="font-size:.78rem;color:#6d4a2a;margin-top:8px;text-align:center">Left click reveal · Right click / long press 🚩 flag</div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>💣 10 mines hidden. Numbers = adjacent mines.</div><div>🚩 Flag suspected mines. Reveal all safe to win.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="mineLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#minesweeperBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='minesweeperBotToggle';
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
    const container=this.root.querySelector('.minesweeper-controls')||this.root.querySelector('.minesweeper-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'minesweeperBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#mineBoard');this.countEl=this.root.querySelector('#mineCount');this.statusEl=this.root.querySelector('#mineStatus');this.logEl=this.root.querySelector('#mineLog');
  this.root.querySelector('#mineNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){
  this.grid=Array(this.h).fill(0).map(()=>Array(this.w).fill(0).map(()=>({mine:false,rev:false,flag:false,adj:0})));
  let placed=0;while(placed<this.mines){const r=Math.floor(Math.random()*this.h),c=Math.floor(Math.random()*this.w);if(!this.grid[r][c].mine){this.grid[r][c].mine=true;placed++;}}
  for(let r=0;r<this.h;r++)for(let c=0;c<this.w;c++){if(this.grid[r][c].mine)continue;let cnt=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<this.h&&nc>=0&&nc<this.w&&this.grid[nr][nc].mine)cnt++;}this.grid[r][c].adj=cnt;}
  this.over=false;this.won=false;this.render();
 }
 render(){
  this.boardEl.innerHTML='';let flags=0;for(let r=0;r<this.h;r++)for(let c=0;c<this.w;c++)if(this.grid[r][c].flag)flags++;
  this.countEl.textContent=`🚩 ${flags}/${this.mines}`;this.statusEl.textContent=this.over?(this.won?'✅ Win!':'💥 Boom!'):`${this.mines-flags} mines left`;
  for(let r=0;r<this.h;r++)for(let c=0;c<this.w;c++){
    const cell=this.grid[r][c];
    const div=document.createElement('div');div.className='minesweeper-cell'+(cell.rev?' revealed':'')+(cell.flag?' flag':'')+(cell.rev&&cell.mine?' mine':'');
    if(cell.rev){
      if(cell.mine)div.textContent='💣';
      else if(cell.adj)div.textContent=cell.adj;
    } else if(cell.flag)div.textContent='';
    div.addEventListener('click',()=>this.reveal(r,c));
    div.addEventListener('contextmenu',e=>{e.preventDefault();this.flag(r,c)});
    let touchTimer;div.addEventListener('touchstart',()=>{touchTimer=setTimeout(()=>this.flag(r,c),500)},{passive:true});div.addEventListener('touchend',()=>clearTimeout(touchTimer));
    this.boardEl.appendChild(div);
  }
 }
 reveal(r,c){
  if(this.over)return;
  const cell=this.grid[r][c];if(cell.rev||cell.flag)return;
  cell.rev=true;
  if(cell.mine){this.over=true;this.won=false; // reveal all mines
    for(let rr=0;rr<this.h;rr++)for(let cc=0;cc<this.w;cc++)if(this.grid[rr][cc].mine)this.grid[rr][cc].rev=true;
    this.render();this.log('💥 Hit mine!',' #ef233c');return;
  }
  if(cell.adj===0){
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<this.h&&nc>=0&&nc<this.w&&!this.grid[nr][nc].rev)this.reveal(nr,nc)}
  }
  // check win
  let hidden=0;for(let rr=0;rr<this.h;rr++)for(let cc=0;cc<this.w;cc++)if(!this.grid[rr][cc].rev&&!this.grid[rr][cc].mine)hidden++;
  if(hidden===0){this.over=true;this.won=true;this.render();this.log('✅ Cleared!',' #2dc653');return}
  this.render();
 }
 flag(r,c){
  if(this.over)return;
  const cell=this.grid[r][c];if(cell.rev)return;cell.flag=!cell.flag;this.render();
 }
}
