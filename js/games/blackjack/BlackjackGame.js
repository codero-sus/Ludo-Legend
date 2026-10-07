/* Blackjack 21 — Vs Dealer, hit/stand, Vegas */
function deck(){const suits=['♠','♥','♦','♣'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];const d=[];for(const s of suits)for(const r of ranks)d.push({s,r});return d.sort(()=>Math.random()-0.5)}
function val(hand){let t=0,aces=0;for(const c of hand){if(c.r==='A'){aces++;t+=11}else if(['J','Q','K'].includes(c.r))t+=10;else t+=parseInt(c.r)}while(t>21&&aces){t-=10;aces--}return t}
export class BlackjackGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="blackjack-layout"><div class="blackjack-card"><div class="blackjack-banner">🃏 Blackjack 21 <span style="opacity:.8;font-weight:400">· Beat dealer to 21</span></div><div class="blackjack-felt"><div style="text-align:center;color:#fff;font-weight:700">Dealer <span id="bjDealerVal"></span></div><div class="blackjack-hand" id="bjDealer"></div><div style="text-align:center;color:var(--gold);font-weight:700;margin-top:10px">You <span id="bjPlayerVal"></span></div><div class="blackjack-hand" id="bjPlayer"></div><div id="bjStatus" style="text-align:center;color:#fff;font-weight:700;margin-top:8px"></div><div class="blackjack-controls"><button id="bjHit" class="gold-btn">Hit</button><button id="bjStand" class="ghost-btn" style="background:#fff;color:#0a4d2a;border-color:#c9a86a">Stand</button><button id="bjNew" class="ghost-btn" style="background:#fff;color:#0a4d2a;border-color:#c9a86a">🔄 Deal</button></div></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>A=1/11, J/Q/K=10. Blackjack 21 wins 3:2.</div><div>Dealer hits <17, stands 17+.</div><div>Very famous in Indian casinos & Diwali!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Score</h3><div id="bjScore" style="color:var(--gold);font-weight:800;font-size:1.1rem"></div></div></aside></div>`;
  this.dealerEl=this.root.querySelector('#bjDealer');this.playerEl=this.root.querySelector('#bjPlayer');this.dVal=this.root.querySelector('#bjDealerVal');this.pVal=this.root.querySelector('#bjPlayerVal');this.statusEl=this.root.querySelector('#bjStatus');this.scoreEl=this.root.querySelector('#bjScore');
  this.root.querySelector('#bjHit').addEventListener('click',()=>this.hit());
  this.root.querySelector('#bjStand').addEventListener('click',()=>this.stand());
  this.root.querySelector('#bjNew').addEventListener('click',()=>this.deal());
  this.wins=0;this.losses=0;this.pushes=0;this.deal();
 }
 onShow(){} onHide(){}
 deal(){
  this.deck=deck();this.player=[this.deck.pop(),this.deck.pop()];this.dealer=[this.deck.pop(),this.deck.pop()];this.over=false;this.statusEl.textContent='Hit or Stand?';this.render();
  if(val(this.player)===21)this.stand();
 }
 render(){
  this.playerEl.innerHTML='';this.dealerEl.innerHTML='';
  this.player.forEach(c=>{const d=document.createElement('div');d.className='bj-card '+(c.s==='♥'||c.s==='♦'?'red':'black');d.textContent=c.r+c.s;this.playerEl.appendChild(d)});
  this.dealer.forEach((c,i)=>{const d=document.createElement('div');d.className='bj-card '+(c.s==='♥'||c.s==='♦'?'red':'black')+(this.over||i===0?'':' hidden');d.textContent=(this.over||i===0)?c.r+c.s:'?';this.dealerEl.appendChild(d)});
  this.pVal.textContent=`(${val(this.player)})`;this.dVal.textContent=this.over?`(${val(this.dealer)})`:'(?)';
  this.scoreEl.textContent=`W ${this.wins} — L ${this.losses} — P ${this.pushes}`;
 }
 hit(){
  if(this.over)return;
  this.player.push(this.deck.pop());this.render();
  if(val(this.player)>21){this.over=true;this.statusEl.textContent='💥 Bust! You lose';this.losses++;this.render()}
 }
 stand(){
  if(this.over)return;
  this.over=true;
  while(val(this.dealer)<17)this.dealer.push(this.deck.pop());
  const pv=val(this.player),dv=val(this.dealer);
  if(dv>21||pv>dv){this.statusEl.textContent='🎉 You win!';this.wins++}
  else if(pv<dv){this.statusEl.textContent='Dealer wins';this.losses++}
  else {this.statusEl.textContent='Push';this.pushes++}
  this.render();
 }
}
