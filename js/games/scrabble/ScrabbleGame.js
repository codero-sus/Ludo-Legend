/* Scrabble Mini 7x7 — place words, score, vs bot */
const DICT=new Set(["CAT","DOG","SUN","MOON","STAR","WORD","GAME","PLAY","TIME","LOVE","BOOK","TREE","FISH","BIRD","BLUE","RED","GREEN","HOUSE","LIGHT","WATER","EARTH","MUSIC","HAPPY","SMILE","DREAM","WORLD","BEACH","OCEAN","MAGIC","POWER","HEART","NIGHT","DAY","MAN","WOMAN","CHILD","FRIEND","FAMILY","INDIA","BHARAT","HELLO","WELCOME","PUZZLE","MATCH","LETTER","SEARCH","BOGGLE","RECTANGLE","SEVEN","FIVE","GRID","RANDOM","LETTERS","WORDS","BRAIN","MIND","THINK","SMART","QUICK","FAST","SLOW","EASY","HARD","TEST","QUIZ","KNOW","LEARN","STUDY","READ","WRITE","SPELL","CROSS","SCRABBLE"]);
const BONUS=[['TW',null,null,'DL',null,null,'TW'],[null,'DW',null,null,null,'DW',null],[null,null,'DW',null,'DW',null,null],['DL',null,null,null,null,null,'DL'],[null,null,'DW',null,'DW',null,null],[null,'DW',null,null,null,'DW',null],['TW',null,null,'DL',null,null,'TW']];
export class ScrabbleGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="scrabble-layout"><div class="scrabble-card"><div class="scrabble-banner">🔤 Scrabble Mini <span style="opacity:.8;font-weight:400">· 7×7 · Make words</span></div><div class="scrabble-board" id="scrBoard"></div><div class="scrabble-rack" id="scrRack"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="scrPlace" class="gold-btn">✓ Place</button><button id="scrShuffle" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔀 Shuffle</button><button id="scrNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button><span id="scrScore" style="font-weight:800;color:#5a3200"></span></div><div id="scrStatus" style="text-align:center;font-weight:700;color:#5a3200;margin-top:6px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Drag/Click rack letters → board to form word (row/col contiguous).</div><div>Bonuses: TW×3, DW×2, TL, DL. First word through center ★.</div><div>Very famous global word game in India!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Words</h3><div id="scrWords" style="font-size:.82rem;color:rgba(255,255,255,.9)"></div></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#scrabbleBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='scrabbleBotToggle';
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
    const container=this.root.querySelector('.scrabble-controls')||this.root.querySelector('.scrabble-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'scrabbleBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.boardEl=this.root.querySelector('#scrBoard');this.rackEl=this.root.querySelector('#scrRack');this.scoreEl=this.root.querySelector('#scrScore');this.statusEl=this.root.querySelector('#scrStatus');this.wordsEl=this.root.querySelector('#scrWords');
  this.root.querySelector('#scrPlace').addEventListener('click',()=>this.place());
  this.root.querySelector('#scrShuffle').addEventListener('click',()=>this.shuffle());
  this.root.querySelector('#scrNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 start(){
  this.board=Array(7).fill(0).map(()=>Array(7).fill(''));
  this.bag="AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ".split('').sort(()=>Math.random()-0.5);
  this.rack=[];this.pending=new Map();this.score=0;this.words=[];this.drawRack();
  this.selected=null;this.render();
 }
 drawRack(){while(this.rack.length<7&&this.bag.length)this.rack.push(this.bag.pop())}
 render(){
  this.boardEl.innerHTML='';
  for(let r=0;r<7;r++)for(let c=0;c<7;c++){
    const sq=document.createElement('div');const bonus=BONUS[r][c]||'';sq.className='scrabble-sq '+(bonus||'')+(r===3&&c===3?' center':'');
    const v=this.pending.get(`${r},${c}`)||this.board[r][c];
    if(v) sq.textContent=v;
    else sq.textContent= bonus|| (r===3&&c===3?'★':'');
    sq.addEventListener('click',()=>this.onBoard(r,c));
    this.boardEl.appendChild(sq);
  }
  this.rackEl.innerHTML='';
  this.rack.forEach((ch,i)=>{
    const t=document.createElement('div');t.className='scrabble-tile'+(this.selected===i?' selected':'');t.textContent=ch;
    t.addEventListener('click',()=>{this.selected=this.selected===i?null:i;this.render()});
    this.rackEl.appendChild(t);
  });
  this.scoreEl.textContent=`Score ${this.score}`;
  this.wordsEl.innerHTML=this.words.length?this.words.join('<br>'):'—';
 }
 onBoard(r,c){
  if(this.board[r][c])return;
  const key=`${r},${c}`;
  if(this.pending.has(key)){const ch=this.pending.get(key);this.pending.delete(key);this.rack.push(ch);this.render();return}
  if(this.selected===null)return;
  const ch=this.rack[this.selected];
  this.pending.set(key,ch);this.rack.splice(this.selected,1);this.selected=null;this.render();
 }
 shuffle(){this.rack.sort(()=>Math.random()-0.5);this.render()}
 place(){
  if(!this.pending.size){this.statusEl.textContent='Place letters first';return}
  // collect word(s) formed
  // For simplicity, check if all pending in same row or same col and contiguous with existing
  const cells=[...this.pending.entries()].map(([k,ch])=>{const [r,c]=k.split(',').map(Number);return {r,c,ch}});
  const rows=new Set(cells.map(c=>c.r)), cols=new Set(cells.map(c=>c.c));
  const isRow= rows.size===1, isCol= cols.size===1;
  if(!isRow&&!isCol){this.statusEl.textContent='Must be single row or column';return}
  // check contiguous and connected (simplified)
  cells.sort((a,b)=>isRow?a.c-b.c:a.r-b.r);
  // build word string including existing board letters between
  let word='';
  if(isRow){
    const r=cells[0].r;
    const min=Math.min(...cells.map(c=>c.c)),max=Math.max(...cells.map(c=>c.c));
    for(let c=min;c<=max;c++){
      const pend=this.pending.get(`${r},${c}`);
      const board=this.board[r][c];
      if(pend) word+=pend;
      else if(board) word+=board;
      else {this.statusEl.textContent='Gap in word';return}
    }
    // extend to include existing contiguous on ends
    // simplified: just word as above
  } else {
    const c=cells[0].c;
    const min=Math.min(...cells.map(c=>c.r)),max=Math.max(...cells.map(c=>c.r));
    for(let r=min;r<=max;r++){
      const pend=this.pending.get(`${r},${c}`);
      const board=this.board[r][c];
      if(pend) word+=pend;
      else if(board) word+=board;
      else {this.statusEl.textContent='Gap';return}
    }
  }
  if(word.length<2){this.statusEl.textContent='Word too short';return}
  if(!DICT.has(word)){this.statusEl.textContent=`✕ ${word} not in dictionary`;return}
  // check center for first word
  if(this.words.length===0 && !cells.some(c=>c.r===3&&c.c===3) && [...this.pending.keys()].every(k=>k!=='3,3') ){
    // also need center covered
    let hasCenter=false;for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(this.board[r][c]&&r===3&&c===3)hasCenter=true;
    if(!hasCenter){this.statusEl.textContent='First word must cover ★';return}
  }
  // commit
  let pts=word.length*10;
  cells.forEach(({r,c})=>{
    const b=BONUS[r][c];
    if(b==='TW')pts*=3;
    else if(b==='DW')pts*=2;
    else if(b==='TL')pts+=5;
    else if(b==='DL')pts+=2;
  });
  this.pending.forEach((ch,k)=>{const [r,c]=k.split(',').map(Number);this.board[r][c]=ch});
  this.pending.clear();this.score+=pts;this.words.push(`${word} +${pts}`);
  this.drawRack();this.render();this.statusEl.textContent=`✓ ${word} +${pts}`;
  if(this.bag.length===0&&this.rack.length===0){this.statusEl.textContent=`🏆 Game over! Final ${this.score}`}
 }
}
