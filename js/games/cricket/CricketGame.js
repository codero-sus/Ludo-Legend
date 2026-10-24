/* games/cricket/CricketGame.js — Gully Cricket — famous in India */
export class CricketGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="cricket-layout"><div class="cricket-card"><div class="cricket-banner">🏏 Gully Cricket <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="cricket-board" id="cricketBoard"></div><div class="cricket-controls"><button id="cricketNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="cricketPlay" class="gold-btn" style="padding:8px 14px">▶ Play</button>`}<span id="cricketStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🏏 <b>Gully Cricket</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="cricketLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#cricketBoard');this.statusEl=this.root.querySelector('#cricketStatus');this.logEl=this.root.querySelector('#cricketLog');this.scoreEl=this.root.querySelector('#cricketScore')||{textContent:''};
  this.root.querySelector('#cricketNew').addEventListener('click',()=>this.start());
  
  
  
  
  
  
  this.root.querySelector('#cricketPlay')?.addEventListener('click',()=>this.play());
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.renderStart && this.renderStart(); this.log('Started Gully Cricket',' #2dc653');}
 
  play(){
    this.score+= Math.floor(Math.random()*10)+1;
    this.boardEl.innerHTML='<div style="height:180px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:radial-gradient(ellipse at center,#1a7a3a,#0a2e1a);border-radius:12px;color:#fff;border:4px solid #c9a86a">🏏 Score '+this.score+'</div>';
    this.log('Scored! Total '+this.score,'#2dc653');
    this.statusEl.textContent='Score '+this.score;
    if(this.score>50){this.statusEl.textContent='🏆 You win! '+this.score;}
  }
}
