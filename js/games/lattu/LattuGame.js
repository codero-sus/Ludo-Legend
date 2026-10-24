/* games/lattu/LattuGame.js — Lattu (Spinning Top) — famous in India */
export class LattuGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="lattu-layout"><div class="lattu-card"><div class="lattu-banner">🌀 Lattu (Spinning Top) <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="lattu-board" id="lattuBoard"></div><div class="lattu-controls"><button id="lattuNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="lattuRoll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button>`}<span id="lattuStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🌀 <b>Lattu (Spinning Top)</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="lattuLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
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
