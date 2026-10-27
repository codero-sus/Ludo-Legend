/* Memory Match 4x4 — flip two, find pairs */
export class MemoryGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="memory-layout"><div class="memory-card"><div class="memory-banner">🃏 Memory Match <span style="opacity:.8;font-weight:400">· 4×4 · Find pairs</span></div><div class="memory-board" id="memBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center"><button id="memNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button><span id="memMoves" style="font-weight:700;color:#5a3200"></span><span id="memTime" style="font-weight:700;color:#7209b7"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Flip 2 cards. Match pair to keep.</div><div>Match all 8 pairs to win. Memory!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Stats</h3><div id="memStats" style="color:rgba(255,255,255,.9);font-size:.9rem"></div></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#memoryBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='memoryBotToggle';
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
    const container=this.root.querySelector('.memory-controls')||this.root.querySelector('.memory-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'memoryBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#memBoard');this.movesEl=this.root.querySelector('#memMoves');this.timeEl=this.root.querySelector('#memTime');this.statsEl=this.root.querySelector('#memStats');
  this.root.querySelector('#memNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){clearInterval(this.timer)}
 start(){
  const icons=['🐶','🐱','🦊','🐻','🐼','🦁','🐯','🐸'];
  let deck=[...icons,...icons].sort(()=>Math.random()-0.5);
  this.cards=deck.map((icon,i)=>({id:i,icon,flipped:false,matched:false}));
  this.flipped=[];this.moves=0;this.matched=0;this.startTime=Date.now();clearInterval(this.timer);this.timer=setInterval(()=>this.tick(),1000);
  this.render();
 }
 tick(){const s=Math.floor((Date.now()-this.startTime)/1000);this.timeEl.textContent=`⏱ ${s}s`;}
 render(){
  this.boardEl.innerHTML='';
  this.cards.forEach((c,i)=>{
    const d=document.createElement('div');d.className='memory-tile'+(c.flipped||c.matched?' flipped':'')+(c.matched?' matched':'');
    d.innerHTML=c.flipped||c.matched?`<span class="back">${c.icon}</span>`:'<span style="color:#fff;font-size:1.2rem">?</span>';
    d.addEventListener('click',()=>this.flip(i));
    this.boardEl.appendChild(d);
  });
  this.movesEl.textContent=`Moves ${this.moves}`;
  this.statsEl.innerHTML=`Matched ${this.matched}/8<br>Moves ${this.moves}`;
  if(this.matched===8){clearInterval(this.timer);this.statsEl.innerHTML+=`<br>🏆 Done in ${this.moves} moves!`}
 }
 flip(i){
  const c=this.cards[i];if(c.flipped||c.matched||this.flipped.length>=2)return;
  c.flipped=true;this.flipped.push(i);this.render();
  if(this.flipped.length===2){
    this.moves++;
    const [a,b]=this.flipped;const ca=this.cards[a],cb=this.cards[b];
    if(ca.icon===cb.icon){setTimeout(()=>{ca.matched=cb.matched=true;this.matched++;this.flipped=[];this.render()},400);}
    else {setTimeout(()=>{ca.flipped=cb.flipped=false;this.flipped=[];this.render()},800);}
  }
 }
}
