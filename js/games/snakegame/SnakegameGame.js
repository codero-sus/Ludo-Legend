/* games/snakegame/SnakegameGame.js — Snake (Nokia) — famous in India */
export class SnakegameGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="snakegame-layout"><div class="snakegame-card"><div class="snakegame-banner">🐍 Snake (Nokia) <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="snakegame-board" id="snakegameBoard"></div><div class="snakegame-controls"><button id="snakegameNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="snakegamePlay" class="gold-btn" style="padding:8px 14px">▶ Play</button>`}<span id="snakegameStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🐍 <b>Snake (Nokia)</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="snakegameLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#snakegameBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='snakegameBotToggle';
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
    const container=this.root.querySelector('.snakegame-controls')||this.root.querySelector('.snakegame-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'snakegameBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#snakegameBoard');this.statusEl=this.root.querySelector('#snakegameStatus');this.logEl=this.root.querySelector('#snakegameLog');this.scoreEl=this.root.querySelector('#snakegameScore')||{textContent:''};
  this.root.querySelector('#snakegameNew').addEventListener('click',()=>this.start());
  
  
  
  
  
  
  this.root.querySelector('#snakegamePlay')?.addEventListener('click',()=>this.play());
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.renderStart && this.renderStart(); this.log('Started Snake (Nokia)',' #2dc653');}
 
  play(){
    this.score+= Math.floor(Math.random()*10)+1;
    this.boardEl.innerHTML='<div style="height:180px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:radial-gradient(ellipse at center,#1a7a3a,#0a2e1a);border-radius:12px;color:#fff;border:4px solid #c9a86a">🐍 Score '+this.score+'</div>';
    this.log('Scored! Total '+this.score,'#2dc653');
    this.statusEl.textContent='Score '+this.score;
    if(this.score>50){this.statusEl.textContent='🏆 You win! '+this.score;}
  }
}
