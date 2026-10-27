/* games/candycrush/CandycrushGame.js — Candy Crush — famous in India */
export class CandycrushGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="candycrush-layout"><div class="candycrush-card"><div class="candycrush-banner">🍬 Candy Crush <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="candycrush-board" id="candycrushBoard"></div><div class="candycrush-controls"><button id="candycrushNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="candycrushFill" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔀 Shuffle</button>`}<span id="candycrushStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🍬 <b>Candy Crush</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="candycrushLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#candycrushBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='candycrushBotToggle';
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
    const container=this.root.querySelector('.candycrush-controls')||this.root.querySelector('.candycrush-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'candycrushBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#candycrushBoard');this.statusEl=this.root.querySelector('#candycrushStatus');this.logEl=this.root.querySelector('#candycrushLog');this.scoreEl=this.root.querySelector('#candycrushScore')||{textContent:''};
  this.root.querySelector('#candycrushNew').addEventListener('click',()=>this.start());
  
  
  
  
  
  this.root.querySelector('#candycrushFill')?.addEventListener('click',()=>this.fill());
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.fill(); this.renderStart && this.renderStart(); this.log('Started Candy Crush',' #2dc653');}
 
  fill(){
    const icons=['🍬','🍭','🍫','🍩','🍪','🧁'];
    this.grid=Array(6).fill(0).map(()=> Array(6).fill(0).map(()=> icons[Math.floor(Math.random()*icons.length)]));
    this.renderGrid();
    this.statusEl.textContent='Match 3 — click two to swap';
  }
  renderGrid(){
    this.boardEl.innerHTML='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;background:#fff;border-radius:10px;padding:6px;border:3px solid #c9a86a">'+this.grid.flat().map((icon,idx)=>'<div data-idx="'+idx+'" style="aspect-ratio:1;background:#f6efdc;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:2px solid transparent">'+icon+'</div>').join('')+'</div>';
    let sel=null;
    this.boardEl.querySelectorAll('[data-idx]').forEach(el=>{
      el.addEventListener('click',()=>{
        const idx=parseInt(el.dataset.idx);
        if(sel===null){sel=idx; el.style.borderColor='var(--gold)';}
        else {
          const r1=Math.floor(sel/6),c1=sel%6,r2=Math.floor(idx/6),c2=idx%6;
          if(Math.abs(r1-r2)+Math.abs(c1-c2)===1){
            const v1=this.grid[r1][c1],v2=this.grid[r2][c2];
            this.grid[r1][c1]=v2; this.grid[r2][c2]=v1;
            this.score+=5; this.scoreEl.textContent='Score '+this.score;
            this.log('Swapped',' #4361ee');
          }
          this.renderGrid();
        }
      });
    });
  }
}
