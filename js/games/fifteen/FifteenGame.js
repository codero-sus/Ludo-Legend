/* games/fifteen/FifteenGame.js — 15 Puzzle — famous in India */
export class FifteenGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="fifteen-layout"><div class="fifteen-card"><div class="fifteen-banner">🔢 15 Puzzle <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="fifteen-board" id="fifteenBoard"></div><div class="fifteen-controls"><button id="fifteenNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="fifteenShuffle" class="gold-btn" style="padding:8px 14px">🔀 Shuffle</button>`}<span id="fifteenStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🔢 <b>15 Puzzle</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="fifteenLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
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
