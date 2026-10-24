/* games/cointoss/CointossGame.js — Head & Tail (Coin Toss) — famous in India */
export class CointossGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="cointoss-layout"><div class="cointoss-card"><div class="cointoss-banner">🪙 Head & Tail (Coin Toss) <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="cointoss-board" id="cointossBoard"></div><div class="cointoss-controls"><button id="cointossNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="cointossRoll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button>`}<span id="cointossStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🪙 <b>Head & Tail (Coin Toss)</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="cointossLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#cointossBoard');this.statusEl=this.root.querySelector('#cointossStatus');this.logEl=this.root.querySelector('#cointossLog');this.scoreEl=this.root.querySelector('#cointossScore')||{textContent:''};
  this.root.querySelector('#cointossNew').addEventListener('click',()=>this.start());
  
  this.root.querySelector('#cointossRoll')?.addEventListener('click',()=>this.roll());
  
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.you=[]; this.bot=[]; this.deal && this.deal(); this.roll && this.roll(); this.renderStart && this.renderStart(); this.log('Started Head & Tail (Coin Toss)',' #2dc653');}
 
  roll(){
    const faces=['⚀','⚁','⚂','⚃','⚄','⚅','☼','☾']; // for Jhandi Munda symbols
    const res=Array(6).fill(0).map(()=> faces[Math.floor(Math.random()*6)]);
    this.boardEl.innerHTML='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:2rem">'+res.join(' ')+'</div>';
    const win = res.filter(r=>r===res[0]).length>=3;
    this.log(win?'🎉 Jackpot!':'Try again', win?'#2dc653':'#5a3200');
    this.statusEl.textContent = res.join(' ') + (win?' — You win!':'');
  }
}
