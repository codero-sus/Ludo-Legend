/* games/fifteen/FifteenGame.js — 15 Puzzle — famous in India */
export class FifteenGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="fifteen-layout"><div class="fifteen-card"><div class="fifteen-banner">🔢 15 Puzzle <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="fifteen-board" id="fifteenBoard"></div><div class="fifteen-controls"><button id="fifteenNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="fifteenShuffle" class="gold-btn" style="padding:8px 14px">🔀 Shuffle</button>`}<span id="fifteenStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔢 <b>15 Puzzle</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="fifteenLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#fifteenBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='fifteenBotToggle';
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
    const container=this.root.querySelector('.fifteen-controls')||this.root.querySelector('.fifteen-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'fifteenBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#fifteenBoard');this.statusEl=this.root.querySelector('#fifteenStatus');this.logEl=this.root.querySelector('#fifteenLog');this.scoreEl=this.root.querySelector('#fifteenScore')||{textContent:''};
  this.root.querySelector('#fifteenNew').addEventListener('click',()=>this.start());
  
  
  
  
  
  
  
  this.root.querySelector('#fifteenShuffle')?.addEventListener('click',()=>this.shuffle());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.renderStart && this.renderStart(); this.log('Started 15 Puzzle',' #2dc653');}
 
  shuffle(){
    this.boardEl.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;max-width:280px;margin:0 auto;background:#5a3200;padding:6px;border-radius:10px">'+Array(9).fill(0).map((_,i)=>'<div style="aspect-ratio:1;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800">'+(i===8?'':i+1)+'</div>').join('')+'</div>';
    this.log('Shuffled — solve by arranging',' #4361ee');
    this.statusEl.textContent='Puzzle ready';
  }
}
