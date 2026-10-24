/* games/lucky7/Lucky7Game.js — Lucky 7 — famous in India */
export class Lucky7Game{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="lucky7-layout"><div class="lucky7-card"><div class="lucky7-banner">🎰 Lucky 7 <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="lucky7-board" id="lucky7Board"></div><div class="lucky7-controls"><button id="lucky7New" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="lucky7Roll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button>`}<span id="lucky7Status" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🎰 <b>Lucky 7</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="lucky7Log" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#lucky7BotToggle')) return;
    const btn=document.createElement('button');
    btn.id='lucky7BotToggle';
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
    const container=this.root.querySelector('.lucky7-controls')||this.root.querySelector('.lucky7-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'lucky7BotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#lucky7Board');this.statusEl=this.root.querySelector('#lucky7Status');this.logEl=this.root.querySelector('#lucky7Log');this.scoreEl=this.root.querySelector('#lucky7Score')||{textContent:''};
  this.root.querySelector('#lucky7New').addEventListener('click',()=>this.start());
  
  this.root.querySelector('#lucky7Roll')?.addEventListener('click',()=>this.roll());
  
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.you=[]; this.bot=[]; this.deal && this.deal(); this.roll && this.roll(); this.renderStart && this.renderStart(); this.log('Started Lucky 7',' #2dc653');}
 
  roll(){
    const faces=['⚀','⚁','⚂','⚃','⚄','⚅','☼','☾']; // for Jhandi Munda symbols
    const res=Array(6).fill(0).map(()=> faces[Math.floor(Math.random()*6)]);
    this.boardEl.innerHTML='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:2rem">'+res.join(' ')+'</div>';
    const win = res.filter(r=>r===res[0]).length>=3;
    this.log(win?'🎉 Jackpot!':'Try again', win?'#2dc653':'#5a3200');
    this.statusEl.textContent = res.join(' ') + (win?' — You win!':'');
  }
}
