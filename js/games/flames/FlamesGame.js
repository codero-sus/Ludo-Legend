/* games/flames/FlamesGame.js — FLAMES — famous in India */
export class FlamesGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="flames-layout"><div class="flames-card"><div class="flames-banner">❤️ FLAMES <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="flames-board" id="flamesBoard"></div><div class="flames-controls"><button id="flamesNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<div style="display:flex;gap:6px;justify-content:center;margin-top:8px"><input id="flamesInput" placeholder="Type guess" style="flex:1;max-width:180px;padding:8px;border-radius:8px;border:2px solid #c9a86a;text-align:center;font-weight:700"><button id="flamesCheck" class="gold-btn">Check</button></div>`}<span id="flamesStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>❤️ <b>FLAMES</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="flamesLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#flamesBoard');this.statusEl=this.root.querySelector('#flamesStatus');this.logEl=this.root.querySelector('#flamesLog');this.scoreEl=this.root.querySelector('#flamesScore')||{textContent:''};
  this.root.querySelector('#flamesNew').addEventListener('click',()=>this.start());
  
  
  
  this.root.querySelector('#flamesCheck')?.addEventListener('click',()=>this.check());
  
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.inputEl=this.root.querySelector('#flamesInput'); this.wordEl=this.root.querySelector('#flamesWord'); this.newWord(); this.renderStart && this.renderStart(); this.log('Started FLAMES',' #2dc653');}
 
  check(){
    const a=this.inputEl.value.trim().toUpperCase();
    const b=this.word;
    if(!a){this.statusEl.textContent='Type something';return}
    if(a===b){this.log('✅ Correct!',' #2dc653'); this.statusEl.textContent='🎉 Correct — New word'; this.newWord();}
    else {this.log('❌ Wrong, try again','#ef233c'); this.statusEl.textContent='❌ Wrong — hint: '+b.slice(0,2)+'...';}
  }
  newWord(){
    const pool=["INDIA","BHARAT","DIWALI","HOLI","CRICKET","FESTIVAL","RANGOLI","PEACOCK","TIGER","ELEPHANT","MANGO","NAMASTE","BOLLYWOOD","GANGA","HIMALAYA","MASALA","CURRY","CHAI","PAKORA","SAMOSA","DESI","JUGAD","DHOL","BANYAN","LOTUS"];
    this.word=pool[Math.floor(Math.random()*pool.length)];
    this.boardEl.innerHTML='<div style="font-size:1.4rem;letter-spacing:.35em;text-align:center;font-weight:800;color:#5a3200">'+this.word.split('').map(()=> '_ ').join('')+'</div><div style="text-align:center;color:#6d4a2a;margin-top:6px;font-size:.82rem">Guess the word — '+this.word.length+' letters</div>';
    this.statusEl.textContent='Guess the word';
  }
}
