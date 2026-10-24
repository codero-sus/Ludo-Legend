/* Solitaire Klondike simplified — drag top card to foundation/tableau, auto-play */
export class SolitaireGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="solitaire-layout"><div class="solitaire-card"><div class="solitaire-banner">♠ Solitaire — Klondike <span style="opacity:.8;font-weight:400">· Classic 52</span></div><div class="solitaire-table" id="solTable"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="solNew" class="ghost-btn" style="background:#fff;color:#0a4d2a;border-color:#c9a86a">🔄 New Deal</button><button id="solAuto" class="gold-btn">✨ Auto Play</button><span id="solStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Build tableau down alternating colors, foundation up by suit A→K.</div><div>Click stock → waste, waste → tableau/foundation.</div><div>Simplified: Auto Play does moves.</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Info</h3><div style="font-size:.82rem;color:rgba(255,255,255,.9)">Very famous Windows game in India! Click Auto for demo.</div></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#solitaireBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='solitaireBotToggle';
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
    const container=this.root.querySelector('.solitaire-controls')||this.root.querySelector('.solitaire-card')||this.root.querySelector('.panel-block')||this.root;
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
          const filtered = avail.filter(el=> el.id!== 'solitaireBotToggle' && !el.textContent.includes('Play with Bot'));
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

  this.tableEl=this.root.querySelector('#solTable');this.statusEl=this.root.querySelector('#solStatus');
  this.root.querySelector('#solNew').addEventListener('click',()=>this.start());
  this.root.querySelector('#solAuto').addEventListener('click',()=>this.auto());
  this.start();
 }
 onShow(){} onHide(){}
 deck(){const suits=['♠','♥','♦','♣'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];const d=[];for(const s of suits)for(const r of ranks)d.push({s,r,rank:ranks.indexOf(r)});return d.sort(()=>Math.random()-0.5)}
 start(){
  const d=this.deck();
  this.tableau=Array(7).fill(0).map((_,i)=>{const pile=d.splice(0,i+1);return pile.map((c,idx)=>({...c,faceUp:idx===pile.length-1}))});
  this.stock=d; this.waste=[]; this.foundation={ '♠':[], '♥':[], '♦':[], '♣':[]};
  this.render();
 }
 render(){
  this.tableEl.innerHTML='';
  const top=document.createElement('div');top.className='solitaire-top';
  // stock
  const stockDiv=document.createElement('div');stockDiv.className='solitaire-pile';stockDiv.innerHTML=this.stock.length?'<div class="s-card back"></div>':'<span style="color:rgba(255,255,255,.6)">Empty</span>';
  stockDiv.addEventListener('click',()=>{if(this.stock.length){this.waste.push({...this.stock.pop(),faceUp:true})} else {this.stock=[...this.waste.reverse().map(c=>({...c,faceUp:false}))];this.waste=[]} this.render()});
  top.appendChild(stockDiv);
  // waste
  const wasteDiv=document.createElement('div');wasteDiv.className='solitaire-pile';
  if(this.waste.length){const c=this.waste[this.waste.length-1];const el=document.createElement('div');el.className='s-card '+(c.s==='♥'||c.s==='♦'?'red':'black');el.textContent=c.r+c.s;el.addEventListener('click',()=>this.tryMoveWaste());wasteDiv.appendChild(el);}
  else wasteDiv.innerHTML='<span style="color:rgba(255,255,255,.4)">Waste</span>';
  top.appendChild(wasteDiv);
  const gap=document.createElement('div');gap.style.opacity='.0';top.appendChild(gap);
  for(const s of ['♠','♥','♦','♣']){
    const f=document.createElement('div');f.className='solitaire-pile';
    const pile=this.foundation[s];
    if(pile.length){const c=pile[pile.length-1];const el=document.createElement('div');el.className='s-card '+(c.s==='♥'||c.s==='♦'?'red':'black');el.textContent=c.r+c.s;f.appendChild(el);}
    else f.innerHTML=`<span style="color:rgba(255,255,255,.5)">${s}</span>`;
    f.addEventListener('click',()=>this.tryToFoundationFromWaste(s));
    top.appendChild(f);
  }
  this.tableEl.appendChild(top);
  const bottom=document.createElement('div');bottom.style.display='grid';bottom.style.gridTemplateColumns='repeat(7,1fr)';bottom.style.gap='8px';
  this.tableau.forEach((pile,pi)=>{
    const col=document.createElement('div');col.style.minHeight='120px';col.style.position='relative';
    pile.forEach((c,idx)=>{
      const el=document.createElement('div');el.className='s-card '+(c.s==='♥'||c.s==='♦'?'red':'black');el.style.position='absolute';el.style.inset='0';el.style.top=(idx*18)+'px';
      if(!c.faceUp){el.classList.add('back');el.textContent='';} else {el.textContent=c.r+c.s; el.addEventListener('click',()=>this.onTableauClick(pi,idx))}
      col.appendChild(el);
    });
    if(pile.length===0){col.style.background='rgba(0,0,0,.12)';col.style.border='2px dashed rgba(255,255,255,.2)';col.style.borderRadius='8px';col.addEventListener('click',()=>this.onEmptyTableau(pi))}
    bottom.appendChild(col);
  });
  this.tableEl.appendChild(bottom);
  const done=Object.values(this.foundation).reduce((a,b)=>a+b.length,0);
  this.statusEl.textContent= done===52? '🏆 Won!': `${done}/52 to foundation`;
 }
 onTableauClick(pi,idx){
  const pile=this.tableau[pi];const card=pile[idx];if(!card.faceUp)return;
  // try foundation
  const suit=card.s;const f=this.foundation[suit];
  const exp= f.length===0?'A':['A','2','3','4','5','6','7','8','9','10','J','Q','K'][f.length];
  if(card.r===exp){
    pile.splice(idx,1); // simplified: only top card actually
    // But if clicked not top, ignore
    if(idx!==pile.length){pile.push(card);return}
    f.push(card);if(pile.length)pile[pile.length-1].faceUp=true;this.render();return;
  }
  // try move to another tableau (only top sequence)
  const moving=pile.slice(idx);
  for(let dest=0;dest<7;dest++){if(dest===pi)continue;const dPile=this.tableau[dest];const top=dPile[dPile.length-1];
    const first=moving[0];
    const canMove= !top ? first.r==='K' : ((first.s==='♥'||first.s==='♦')!==(top.s==='♥'||top.s==='♦') && first.rank===top.rank-1);
    if(canMove){this.tableau[dest].push(...moving);pile.splice(idx,moving.length);if(pile.length)pile[pile.length-1].faceUp=true;this.render();return;}
  }
 }
 tryMoveWaste(){
  if(!this.waste.length)return;
  const card=this.waste[this.waste.length-1];
  // try foundation
  const f=this.foundation[card.s];const exp= f.length===0?'A':['A','2','3','4','5','6','7','8','9','10','J','Q','K'][f.length];
  if(card.r===exp){f.push(this.waste.pop());this.render();return;}
  // try tableau
  for(let dest=0;dest<7;dest++){
    const dPile=this.tableau[dest];const top=dPile[dPile.length-1];
    const canMove= !top ? card.r==='K' : ((card.s==='♥'||card.s==='♦')!==(top.s==='♥'||top.s==='♦') && card.rank===top.rank-1);
    if(canMove){dPile.push(this.waste.pop());this.render();return;}
  }
 }
 tryToFoundationFromWaste(suit){
  // alternative click foundation
  this.tryMoveWaste();
 }
 onEmptyTableau(pi){
  if(this.waste.length&&this.waste[this.waste.length-1].r==='K'){this.tableau[pi].push(this.waste.pop());this.render()}
 }
 auto(){
  // simple auto: keep trying waste->foundation/tableau and tableau->foundation
  let moved=true;let steps=0;
  const doStep=()=>{
    if(steps++>120) return;
    moved=false;
    // tableau to foundation
    for(let pi=0;pi<7;pi++){
      const pile=this.tableau[pi];if(!pile.length)continue;const top=pile[pile.length-1];if(!top.faceUp)continue;
      const f=this.foundation[top.s];const exp= f.length===0?'A':['A','2','3','4','5','6','7','8','9','10','J','Q','K'][f.length];
      if(top.r===exp){f.push(pile.pop());if(pile.length)pile[pile.length-1].faceUp=true;moved=true;break}
    }
    if(moved){this.render();setTimeout(doStep,180);return}
    // waste to foundation/tableau
    if(this.waste.length){const card=this.waste[this.waste.length-1];const f=this.foundation[card.s];const exp= f.length===0?'A':['A','2','3','4','5','6','7','8','9','10','J','Q','K'][f.length];if(card.r===exp){f.push(this.waste.pop());moved=true;this.render();setTimeout(doStep,180);return}}
    // draw
    if(this.stock.length){this.waste.push({...this.stock.pop(),faceUp:true});this.render();setTimeout(doStep,180);return}
    if(!this.stock.length&&this.waste.length){this.stock=[...this.waste.reverse().map(c=>({...c,faceUp:false}))];this.waste=[];this.render();setTimeout(doStep,180);return}
  };
  doStep();
 }
}
