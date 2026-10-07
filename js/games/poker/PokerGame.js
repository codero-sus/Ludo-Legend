/* Poker Texas Hold'em simplified — 5 community, best 5-card hand, vs 2 bots, all-in showdown */
const RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
function newDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push({r,s});return d.sort(()=>Math.random()-0.5)}
function handRank(cards){
 // simplified: pairs, two pair, trips, straight, flush, full house, quads, straight flush — score
 // return numeric strength
 const cnt={};const suitCnt={};cards.forEach(c=>{cnt[c.r]=(cnt[c.r]||0)+1;suitCnt[c.s]=(suitCnt[c.s]||0)+1});
 const counts=Object.values(cnt).sort((a,b)=>b-a);
 const isFlush=Math.max(...Object.values(suitCnt))>=5;
 const vals=cards.map(c=>RANKS.indexOf(c.r)).sort((a,b)=>a-b);
 let isStraight=false;
 for(let i=0;i<=vals.length-5;i++){if(vals[i+4]-vals[i]===4&&new Set(vals.slice(i,i+5)).size===5)isStraight=true}
 if(vals.includes(12)&&vals.includes(0)&&vals.includes(1)&&vals.includes(2)&&vals.includes(3))isStraight=true;
 if(isStraight&&isFlush)return 8+ Math.max(...vals)/100;
 if(counts[0]===4)return 7;
 if(counts[0]===3&&counts[1]===2)return 6;
 if(isFlush)return 5;
 if(isStraight)return 4;
 if(counts[0]===3)return 3;
 if(counts[0]===2&&counts[1]===2)return 2;
 if(counts[0]===2)return 1;
 return 0;
}
export class PokerGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="poker-layout"><div class="poker-card"><div class="poker-banner">♠ Texas Hold'em <span style="opacity:.8;font-weight:400">· Simplified showdown</span></div><div class="poker-table"><div style="text-align:center;color:var(--gold);font-weight:700">Community</div><div class="poker-community" id="pokerCommunity"></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center;color:#fff;font-weight:700"><div>🧑 You<div id="pokerYou" style="display:flex;gap:6px;justify-content:center;margin-top:6px"></div><div id="pokerYouRank" style="font-size:.75rem;color:var(--gold)"></div></div><div>🤖 Bot 1<div id="pokerB1" style="display:flex;gap:6px;justify-content:center;margin-top:6px"></div><div id="pokerB1Rank" style="font-size:.75rem;color:var(--gold)"></div></div><div>🤖 Bot 2<div id="pokerB2" style="display:flex;gap:6px;justify-content:center;margin-top:6px"></div><div id="pokerB2Rank" style="font-size:.75rem;color:var(--gold)"></div></div></div><div id="pokerStatus" style="text-align:center;color:#fff;font-weight:700;margin-top:12px"></div><div style="display:flex;gap:8px;justify-content:center;margin-top:10px"><button id="pokerDeal" class="gold-btn">🔄 Deal & Showdown</button><button id="pokerReveal" class="ghost-btn" style="background:#fff;color:#1a1a2a">👁 Reveal</button></div></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>2 hole + 5 community = best 5-card hand.</div><div>Hand ranks: Pair < Two Pair < Trips < Straight < Flush < Full House < Quads < Straight Flush</div><div>Very famous in India — Diwali poker!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Result</h3><div id="pokerResult" style="color:var(--gold);font-weight:800"></div></div></aside></div>`;
  this.commEl=this.root.querySelector('#pokerCommunity');this.youEl=this.root.querySelector('#pokerYou');this.b1El=this.root.querySelector('#pokerB1');this.b2El=this.root.querySelector('#pokerB2');this.statusEl=this.root.querySelector('#pokerStatus');this.resultEl=this.root.querySelector('#pokerResult');
  this.root.querySelector('#pokerDeal').addEventListener('click',()=>this.deal());
  this.root.querySelector('#pokerReveal').addEventListener('click',()=>this.reveal());
  this.deal();
 }
 onShow(){} onHide(){}
 cardEl(c,hidden=false){const d=document.createElement('div');d.className='poker-card-mini '+(c.s==='♥'||c.s==='♦'?'red':'black');d.textContent=hidden?'?':c.r+c.s;if(hidden)d.style.background='linear-gradient(135deg,#4361ee,#7209b7)';d.style.color=hidden?'transparent':'';return d}
 deal(){
  const d=newDeck();
  this.you=[d.pop(),d.pop()];this.b1=[d.pop(),d.pop()];this.b2=[d.pop(),d.pop()];this.community=[d.pop(),d.pop(),d.pop(),d.pop(),d.pop()];
  this.revealed=false;this.render();
 }
 render(){
  this.commEl.innerHTML='';this.community.forEach(c=>this.commEl.appendChild(this.cardEl(c)));
  this.youEl.innerHTML='';this.you.forEach(c=>this.youEl.appendChild(this.cardEl(c,this.revealed?false:true)));
  // show back if not revealed, but for demo reveal hole on demand; initially hidden
  if(this.revealed){
    this.youEl.innerHTML='';this.you.forEach(c=>this.youEl.appendChild(this.cardEl(c)));
    this.b1El.innerHTML='';this.b1.forEach(c=>this.b1El.appendChild(this.cardEl(c)));
    this.b2El.innerHTML='';this.b2.forEach(c=>this.b2El.appendChild(this.cardEl(c)));
    const rY=handRank([...this.you,...this.community]),r1=handRank([...this.b1,...this.community]),r2=handRank([...this.b2,...this.community]);
    const names=['High Card','Pair','Two Pair','Trips','Straight','Flush','Full House','Quads','Straight Flush'];
    this.root.querySelector('#pokerYouRank').textContent=names[Math.floor(rY)];
    this.root.querySelector('#pokerB1Rank').textContent=names[Math.floor(r1)];
    this.root.querySelector('#pokerB2Rank').textContent=names[Math.floor(r2)];
    const best=Math.max(rY,r1,r2);
    let win;
    if(rY===best&&r1!==best&&r2!==best)win='You win!';
    else if(r1===best&&rY!==best&&r2!==best)win='Bot 1 wins!';
    else if(r2===best&&rY!==best&&r1!==best)win='Bot 2 wins!';
    else win='Split pot!';
    this.resultEl.textContent=win; this.statusEl.textContent='Showdown — '+win;
  } else {
    this.b1El.innerHTML='';this.b1.forEach(()=>this.b1El.appendChild(this.cardEl({r:'?',s:'♠'},true)));
    this.b2El.innerHTML='';this.b2.forEach(()=>this.b2El.appendChild(this.cardEl({r:'?',s:'♠'},true)));
    this.root.querySelector('#pokerYouRank').textContent='?';
    this.root.querySelector('#pokerB1Rank').textContent='?';
    this.root.querySelector('#pokerB2Rank').textContent='?';
    this.resultEl.textContent='—'; this.statusEl.textContent='Deal & Reveal to showdown';
  }
 }
 reveal(){this.revealed=true;this.render()}
}
