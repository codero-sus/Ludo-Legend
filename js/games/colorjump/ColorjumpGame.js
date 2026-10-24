/* games/colorjump/ColorjumpGame.js — Color Jump (Chidiya Udd) — famous in India */
export class ColorjumpGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="colorjump-layout"><div class="colorjump-card"><div class="colorjump-banner">🐦 Color Jump (Chidiya Udd) <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="colorjump-board" id="colorjumpBoard"></div><div class="colorjump-controls"><button id="colorjumpNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="colorjumpPlay" class="gold-btn" style="padding:8px 14px">▶ Play</button>`}<span id="colorjumpStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🐦 <b>Color Jump (Chidiya Udd)</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="colorjumpLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#colorjumpBoard');this.statusEl=this.root.querySelector('#colorjumpStatus');this.logEl=this.root.querySelector('#colorjumpLog');this.scoreEl=this.root.querySelector('#colorjumpScore')||{textContent:''};
  this.root.querySelector('#colorjumpNew').addEventListener('click',()=>this.start());
  
  
  
  
  
  
  this.root.querySelector('#colorjumpPlay')?.addEventListener('click',()=>this.play());
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.renderStart && this.renderStart(); this.log('Started Color Jump (Chidiya Udd)',' #2dc653');}
 
  play(){
    this.score+= Math.floor(Math.random()*10)+1;
    this.boardEl.innerHTML='<div style="height:180px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:radial-gradient(ellipse at center,#1a7a3a,#0a2e1a);border-radius:12px;color:#fff;border:4px solid #c9a86a">🐦 Score '+this.score+'</div>';
    this.log('Scored! Total '+this.score,'#2dc653');
    this.statusEl.textContent='Score '+this.score;
    if(this.score>50){this.statusEl.textContent='🏆 You win! '+this.score;}
  }
}
