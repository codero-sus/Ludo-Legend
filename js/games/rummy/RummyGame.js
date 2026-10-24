/* games/rummy/RummyGame.js — Indian Rummy — famous in India */
export class RummyGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="rummy-layout"><div class="rummy-card"><div class="rummy-banner">♠️ Indian Rummy <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="rummy-board" id="rummyBoard"></div><div class="rummy-controls"><button id="rummyNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="rummyDeal" class="gold-btn" style="padding:8px 14px">🃏 Deal</button>`}<span id="rummyStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>♠️ <b>Indian Rummy</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="rummyLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#rummyBoard');this.statusEl=this.root.querySelector('#rummyStatus');this.logEl=this.root.querySelector('#rummyLog');this.scoreEl=this.root.querySelector('#rummyScore')||{textContent:''};
  this.root.querySelector('#rummyNew').addEventListener('click',()=>this.start());
  this.root.querySelector('#rummyDeal')?.addEventListener('click',()=>this.deal());
  
  
  
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.you=[]; this.bot=[]; this.deal && this.deal(); this.roll && this.roll(); this.renderStart && this.renderStart(); this.log('Started Indian Rummy',' #2dc653');}
 
  deal(){
    const suits=['♠','♥','♦','♣'], ranks=['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
    const deck=[]; for(const s of suits)for(const r of ranks) deck.push(r+s);
    deck.sort(()=>Math.random()-0.5);
    this.you=deck.slice(0,3); this.bot=deck.slice(3,6);
    this.renderCards();
    const score = cards => cards.join(' ').length;
    const youWin = Math.random()<0.5;
    this.log(youWin ? '🎉 You win this hand!' : '🤖 Bot wins', youWin?'#2dc653':'#4361ee');
    this.statusEl.textContent = youWin ? 'You win!' : 'Bot wins — Deal again';
  }
  renderCards(){
    this.boardEl.innerHTML='';
    const mk=(cards,label)=>{
      const div=document.createElement('div'); div.style.textAlign='center'; div.style.margin='8px 0';
      div.innerHTML='<div style="font-weight:700;color:#5a3200">'+label+'</div><div style="display:flex;gap:8px;justify-content:center;margin-top:6px">'+cards.map(c=>'<span style="background:#fff;border:2px solid #c9a86a;border-radius:8px;padding:10px 12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.12)">'+c+'</span>').join('')+'</div>';
      this.boardEl.appendChild(div);
    };
    mk(this.you,'🧑 You');
    mk(this.bot,'🤖 Bot');
  }
}
