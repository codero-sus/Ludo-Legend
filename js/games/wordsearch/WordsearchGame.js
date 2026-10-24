/* games/wordsearch/WordsearchGame.js — Word Search — famous in India */
export class WordsearchGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="wordsearch-layout"><div class="wordsearch-card"><div class="wordsearch-banner">🔍 Word Search <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="wordsearch-board" id="wordsearchBoard"></div><div class="wordsearch-controls"><button id="wordsearchNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<div style="display:flex;gap:6px;justify-content:center;margin-top:8px"><input id="wordsearchInput" placeholder="Type guess" style="flex:1;max-width:180px;padding:8px;border-radius:8px;border:2px solid #c9a86a;text-align:center;font-weight:700"><button id="wordsearchCheck" class="gold-btn">Check</button></div>`}<span id="wordsearchStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔍 <b>Word Search</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="wordsearchLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#wordsearchBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='wordsearchBotToggle';
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
    const container=this.root.querySelector('.wordsearch-controls')||this.root.querySelector('.wordsearch-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'wordsearchBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#wordsearchBoard');this.statusEl=this.root.querySelector('#wordsearchStatus');this.logEl=this.root.querySelector('#wordsearchLog');this.scoreEl=this.root.querySelector('#wordsearchScore')||{textContent:''};
  this.root.querySelector('#wordsearchNew').addEventListener('click',()=>this.start());
  
  
  
  this.root.querySelector('#wordsearchCheck')?.addEventListener('click',()=>this.check());
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.inputEl=this.root.querySelector('#wordsearchInput'); this.wordEl=this.root.querySelector('#wordsearchWord'); this.newWord(); this.renderStart && this.renderStart(); this.log('Started Word Search',' #2dc653');}
 
  check(){
    const a=this.inputEl.value.trim().toUpperCase();
    const b=this.word;
    if(!a){this.statusEl.textContent='Type something';return}
    if(a===b){this.log('✅ Correct!',' #2dc653'); this.statusEl.textContent='🎉 Correct — New word'; this.newWord();}
    else {this.log('❌ Wrong, try again','#ef233c'); this.statusEl.textContent='❌ Wrong — hint: '+b.slice(0,2)+'...';}
  }
  newWord(){
    const pool=["INDIA","BHARAT","DIWALI","HOLI","CRICKET","FESTIVAL","RANGOLI","PEACOCK","TIGER","ELEPHANT","MANGO","NAMASTE","BOLLYWOOD","GANGA","HIMALAYA","MASALA","CURRY","CHAI","PAKORA","SAMOSA","DESI","JUGAD","DHOL","BANYAN","LOTUS"];
    this.word=pool[Math.floor(Math.random()*pool.length)];
    this.boardEl.innerHTML='<div style="font-size:1.4rem;letter-spacing:.35em;text-align:center;font-weight:800;color:#5a3200">'+this.word.split('').map(()=> '_ ').join('')+'</div><div style="text-align:center;color:#6d4a2a;margin-top:6px;font-size:.82rem">Guess the word — '+this.word.length+' letters</div>';
    this.statusEl.textContent='Guess the word';
  }
}
