/* Monopoly Deal simplified — 40-track, roll 2 dice, buy/rent, very famous in India */
const NAMES=["GO","Mediterranean","Community","Baltic","Tax","Reading RR","Oriental","Chance","Vermont","Connecticut","Jail","St Charles","Electric","States","Virginia","Penn RR","St James","Community2","Tennessee","NY Ave","Free","Kentucky","Chance2","Indiana","Illinois","B&O RR","Atlantic","Ventnor","Water","Marvin","GoToJail","Pacific","NC Ave","Community3","Penn Ave","Short Line","Chance3","Park Place","Tax2","Boardwalk"];
export class MonopolyGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="monopoly-layout"><div class="monopoly-card"><div class="monopoly-banner">🏦 Monopoly <span style="opacity:.8;font-weight:400">· Deal · 40 spaces</span></div><div class="monopoly-board" id="monoBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center;flex-wrap:wrap"><button id="monoRoll" class="gold-btn">🎲 Roll</button><span id="monoDice" style="font-weight:800;color:#5a3200"></span><span id="monoTurn" style="font-weight:700;color:#5a3200"></span><button id="monoNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button></div><div id="monoInfo" style="text-align:center;font-weight:700;color:#7a0a0a;margin-top:6px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">💰 Assets</h3><div id="monoAssets" style="font-size:.82rem;color:rgba(255,255,255,.9)"></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="monoLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#monoBoard');this.diceEl=this.root.querySelector('#monoDice');this.turnEl=this.root.querySelector('#monoTurn');this.infoEl=this.root.querySelector('#monoInfo');this.assetsEl=this.root.querySelector('#monoAssets');this.logEl=this.root.querySelector('#monoLog');
  this.root.querySelector('#monoRoll').addEventListener('click',()=>this.roll());
  this.root.querySelector('#monoNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>12)this.logEl.lastChild.remove()}
 start(){
  this.pos=[0,0];this.cash=[1500,1500];this.owned=Array(40).fill(null);this.turn=0;this.winner=null;this.render();
 }
 render(){
  this.boardEl.innerHTML='';
  NAMES.forEach((name,i)=>{
    const cell=document.createElement('div');cell.className='monopoly-cell'+([0,10,20,30].includes(i)?' corner':'')+(this.owned[i]?' owned':'');
    if([0,10,20,30].includes(i))cell.innerHTML=`<div>${name}</div>`;
    else {cell.innerHTML=`<div style="font-size:.6rem">${name.slice(0,10)}</div>${this.owned[i]!==null?`<div style="font-size:.6rem;color:${this.owned[i]===0?'#2dc653':'#4361ee'}">${this.owned[i]===0?'You':'Bot'}</div>`:''}<div style="font-size:.55rem;color:#6d4a2a">$${(i%10+1)*20}</div>`}
    // tokens
    this.pos.forEach((p,pi)=>{
      if(p===i){
        const t=document.createElement('div');t.className='monopoly-token';t.style.left=`${20+pi*30}%`;t.style.top='70%';t.style.background=pi===0?'#ef233c':'#4361ee';t.textContent=pi===0?'🧑':'🤖';
        cell.appendChild(t);cell.style.position='relative';
      }
    });
    this.boardEl.appendChild(cell);
  });
  this.diceEl.textContent='';
  this.turnEl.textContent=this.winner?`🏆 ${this.winner}`:(this.turn===0?'🧑 Your turn':'🤖 Bot turn');
  this.infoEl.textContent=`You $${this.cash[0]} · Bot $${this.cash[1]}`;
  this.assetsEl.innerHTML=`<div>🧑 You owns ${this.owned.filter(o=>o===0).length} / 🏦 ${this.owned.filter(o=>o!==null).length} sold</div><div>Owned: ${this.owned.map((o,i)=>o===0?NAMES[i]:null).filter(Boolean).join(', ')||'—'}</div>`;
 }
 roll(){
  if(this.winner)return;
  if(this.turn===1)return;
  const d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;
  this.diceEl.textContent=`🎲 ${d1}+${d2}=${d1+d2}`;
  this.move(this.turn,d1+d2);
  if(!this.winner){
    this.turn=1;
    this.render();
    setTimeout(()=>this.botRoll(),800);
  }
 }
 move(player,steps){
  const old=this.pos[player];
  this.pos[player]=(old+steps)%40;
  if(this.pos[player]<old){this.cash[player]+=200;this.log(`${player===0?'You':'Bot'} passed GO +$200`,'#2dc653');}
  const loc=this.pos[player];
  const price=(loc%10+1)*20;
  if([0,10,20,30].includes(loc)){this.log(`${player===0?'You':'Bot'} lands on ${NAMES[loc]}`,'#5a3200');}
  else if(this.owned[loc]===null){
    if(this.cash[player]>=price){
      if(player===0||Math.random()<0.6){this.owned[loc]=player;this.cash[player]-=price;this.log(`${player===0?'You':'Bot'} buys ${NAMES[loc]} $${price}`,'#4361ee');}
    }
  } else if(this.owned[loc]!==player){
    const rent=Math.floor(price*0.4);
    this.cash[player]-=rent; this.cash[this.owned[loc]]+=rent;
    this.log(`${player===0?'You':'Bot'} pays rent $${rent} to ${this.owned[loc]===0?'You':'Bot'} at ${NAMES[loc]}`,'#ef233c');
    if(this.cash[player]<0){this.winner=player===0?'Bot':'You';this.log(`💀 ${player===0?'You':'Bot'} bankrupt!`,'#ef233c');}
  }
  this.render();
 }
 botRoll(){
  if(this.winner)return;
  const d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;
  this.diceEl.textContent=`🎲 ${d1}+${d2}=${d1+d2} (Bot)`;
  this.move(1,d1+d2);
  if(this.winner)return;
  this.turn=0;this.render();
 }
}
