/* games/lattu/LattuGame.js — Lattu (Spinning Top) — famous in India */
export class LattuGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="lattu-layout"><div class="lattu-card"><div class="lattu-banner">🌀 Lattu (Spinning Top) <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="lattu-board" id="lattuBoard"></div><div class="lattu-controls"><button id="lattuNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="lattuRoll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button>`}<span id="lattuStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🌀 <b>Lattu (Spinning Top)</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="lattuLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#lattuBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='lattuBotToggle';
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
    const container=this.root.querySelector('.lattu-controls')||this.root.querySelector('.lattu-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'lattuBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#lattuBoard');this.statusEl=this.root.querySelector('#lattuStatus');this.logEl=this.root.querySelector('#lattuLog');this.scoreEl=this.root.querySelector('#lattuScore')||{textContent:''};
  this.root.querySelector('#lattuNew').addEventListener('click',()=>this.start());
  
  
  this.root.querySelector('#lattuRoll')?.addEventListener('click',()=>this.roll());
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.pos=0; this.roll(); this.renderStart && this.renderStart(); this.log('Started Lattu (Spinning Top)',' #2dc653');}
 
  roll(){
    const v=Math.floor(Math.random()*6)+1;
    this.pos=(this.pos+v)%24;
    this.boardEl.innerHTML='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">'+Array(24).fill(0).map((_,i)=>'<div style="aspect-ratio:1;background:'+(i===this.pos?'var(--gold)':'#fff')+';border:2px solid #c9b48a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700">'+(i===this.pos?'🌀':i+1)+'</div>').join('')+'</div><div style="text-align:center;margin-top:8px;font-weight:700;color:#5a3200">Rolled '+v+' → position '+(this.pos+1)+'</div>';
    this.log('Rolled '+v,'#4361ee');
    if(this.pos===23){this.log('🏆 Reached home!','#2dc653'); this.statusEl.textContent='🏆 You win!';}
    else this.statusEl.textContent='Position '+(this.pos+1)+'/24';
  }
}
