/* games/sequence/SequenceGame.js — Sequence — famous in India */
export class SequenceGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="sequence-layout"><div class="sequence-card"><div class="sequence-banner">🔢 Sequence <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="sequence-board" id="sequenceBoard"></div><div class="sequence-controls"><button id="sequenceNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="sequenceDeal" class="gold-btn" style="padding:8px 14px">🃏 Deal</button>`}<span id="sequenceStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔢 <b>Sequence</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="sequenceLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#sequenceBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='sequenceBotToggle';
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
    const container=this.root.querySelector('.sequence-controls')||this.root.querySelector('.sequence-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'sequenceBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#sequenceBoard');this.statusEl=this.root.querySelector('#sequenceStatus');this.logEl=this.root.querySelector('#sequenceLog');this.scoreEl=this.root.querySelector('#sequenceScore')||{textContent:''};
  this.root.querySelector('#sequenceNew').addEventListener('click',()=>this.start());
  this.root.querySelector('#sequenceDeal')?.addEventListener('click',()=>this.deal());
  
  
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.you=[]; this.bot=[]; this.deal && this.deal(); this.roll && this.roll(); this.renderStart && this.renderStart(); this.log('Started Sequence',' #2dc653');}
 
  deal(){
    const suits=['♠','♥','♦','♣'], ranks=['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
    const deck=[]; for(const s of suits)for(const r of ranks) deck.push(r+s);
    deck.sort(()=>Math.random()-0.5);
    this.you=deck.slice(0,3); this.bot=deck.slice(3,6);
    this.renderCards();
    const score = cards => cards.join(' ').length;
    const youWin = Math.random()<0.5;
    this.log(youWin ? '🎉 You win this hand!' : '🤖 Bot wins', youWin?'#2dc653':'#4361ee');
    this.statusEl.textContent = youWin ? 'You win!' : 'Bot wins — Deal again';
  }
  renderCards(){
    this.boardEl.innerHTML='';
    const mk=(cards,label)=>{
      const div=document.createElement('div'); div.style.textAlign='center'; div.style.margin='8px 0';
      div.innerHTML='<div style="font-weight:700;color:#5a3200">'+label+'</div><div style="display:flex;gap:8px;justify-content:center;margin-top:6px">'+cards.map(c=>'<span style="background:#fff;border:2px solid #c9a86a;border-radius:8px;padding:10px 12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.12)">'+c+'</span>').join('')+'</div>';
      this.boardEl.appendChild(div);
    };
    mk(this.you,'🧑 You');
    mk(this.bot,'🤖 Bot');
  }
}
