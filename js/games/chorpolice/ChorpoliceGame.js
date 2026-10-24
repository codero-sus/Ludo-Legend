/* games/chorpolice/ChorpoliceGame.js — Chor Police — famous in India */
export class ChorpoliceGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="chorpolice-layout"><div class="chorpolice-card"><div class="chorpolice-banner">👮 Chor Police <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="chorpolice-board" id="chorpoliceBoard"></div><div class="chorpolice-controls"><button id="chorpoliceNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="chorpoliceRoll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button>`}<span id="chorpoliceStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>👮 <b>Chor Police</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="chorpoliceLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#chorpoliceBoard');this.statusEl=this.root.querySelector('#chorpoliceStatus');this.logEl=this.root.querySelector('#chorpoliceLog');this.scoreEl=this.root.querySelector('#chorpoliceScore')||{textContent:''};
  this.root.querySelector('#chorpoliceNew').addEventListener('click',()=>this.start());
  
  
  this.root.querySelector('#chorpoliceRoll')?.addEventListener('click',()=>this.roll());
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.pos=0; this.roll(); this.renderStart && this.renderStart(); this.log('Started Chor Police',' #2dc653');}
 
  roll(){
    const v=Math.floor(Math.random()*6)+1;
    this.pos=(this.pos+v)%24;
    this.boardEl.innerHTML='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">'+Array(24).fill(0).map((_,i)=>'<div style="aspect-ratio:1;background:'+(i===this.pos?'var(--gold)':'#fff')+';border:2px solid #c9b48a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700">'+(i===this.pos?'👮':i+1)+'</div>').join('')+'</div><div style="text-align:center;margin-top:8px;font-weight:700;color:#5a3200">Rolled '+v+' → position '+(this.pos+1)+'</div>';
    this.log('Rolled '+v,'#4361ee');
    if(this.pos===23){this.log('🏆 Reached home!','#2dc653'); this.statusEl.textContent='🏆 You win!';}
    else this.statusEl.textContent='Position '+(this.pos+1)+'/24';
  }
}
