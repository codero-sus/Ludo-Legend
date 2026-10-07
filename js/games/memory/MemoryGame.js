/* Memory Match 4x4 — flip two, find pairs */
export class MemoryGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="memory-layout"><div class="memory-card"><div class="memory-banner">🃏 Memory Match <span style="opacity:.8;font-weight:400">· 4×4 · Find pairs</span></div><div class="memory-board" id="memBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center"><button id="memNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button><span id="memMoves" style="font-weight:700;color:#5a3200"></span><span id="memTime" style="font-weight:700;color:#7209b7"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Flip 2 cards. Match pair to keep.</div><div>Match all 8 pairs to win. Memory!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Stats</h3><div id="memStats" style="color:rgba(255,255,255,.9);font-size:.9rem"></div></div></aside></div>`;
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
