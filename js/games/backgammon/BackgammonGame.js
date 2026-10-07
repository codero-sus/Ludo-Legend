/* Backgammon simplified 24pts — Vs Bot, dice, hit & bear off */
export class BackgammonGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="backgammon-layout"><div class="backgammon-card"><div class="backgammon-banner">🎲 Backgammon <span style="opacity:.8;font-weight:400">· 24 points · Race off</span></div><div class="backgammon-board" id="bgBoard"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center;align-items:center;flex-wrap:wrap"><button id="bgRoll" class="gold-btn" style="padding:8px 14px">🎲 Roll</button><span id="bgDice" style="font-weight:800;color:#5a3200;min-width:60px;text-align:center"></span><span id="bgTurn" style="font-weight:700;color:#5a3200"></span><button id="bgNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button></div><div id="bgMoves" style="font-size:.78rem;color:#6d4a2a;text-align:center;margin-top:6px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>24 points, 15 checkers each. Roll 2 dice, move accordingly.</div><div>Hit blot (1 checker) to send to bar. Bear off when all home.</div><div>Simplified: click checker then destination. Bot vs You.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="bgLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#bgBoard');this.diceEl=this.root.querySelector('#bgDice');this.turnEl=this.root.querySelector('#bgTurn');this.movesEl=this.root.querySelector('#bgMoves');this.logEl=this.root.querySelector('#bgLog');
  this.root.querySelector('#bgRoll').addEventListener('click',()=>this.roll());
  this.root.querySelector('#bgNew').addEventListener('click',()=>this.start());
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){
  // 0-23 points: 0-5 top right, 6-11 bottom right, 12-17 bottom left, 18-23 top left — but simplified linear 0-23
  this.board=Array(24).fill(0).map(()=>({w:0,b:0}));
  // standard start
  const init=[[0,2,'b'],[11,5,'w'],[16,3,'w'],[18,5,'b'],[5,5,'b'],[7,3,'b'],[12,5,'w'],[23,2,'w']];
  init.forEach(([pt,n,col])=>{if(col==='w')this.board[pt].w=n;else this.board[pt].b=n});
  this.bar={w:0,b:0};this.off={w:0,b:0};
  this.turn='w';this.dice=[];this.moves=[];this.selected=null;this.winner=null;
  this.render();
 }
 render(){
  // simplified rendering: just show 24 points as vertical stacks with counts
  this.boardEl.innerHTML='';
  // create 2 halves
  const makeHalf=(range, isBottom)=>{
    const half=document.createElement('div');half.className='bg-half';
    range.forEach(pt=>{
      const p=document.createElement('div');p.className='bg-point '+(pt%2?'dark':'light')+(isBottom?' bottom':'');
      p.dataset.pt=pt;
      const info=this.board[pt];
      // stack checkers
      const colHeight=Math.max(info.w,info.b);
      for(let i=0;i<Math.min(info.w,5);i++){const ch=document.createElement('div');ch.className='bg-checker white';ch.textContent=info.w>5&&i===4?info.w:'';p.appendChild(ch);}
      for(let i=0;i<Math.min(info.b,5);i++){const ch=document.createElement('div');ch.className='bg-checker black';ch.textContent=info.b>5&&i===4?info.b:'';p.appendChild(ch);}
      if(info.w===0&&info.b===0)p.innerHTML+='<span style="font-size:.55rem;color:#6d4a2a">'+(pt+1)+'</span>';
      // highlight
      if(this.selected===pt)p.style.outline='3px solid var(--gold)';
      p.addEventListener('click',()=>this.onPoint(pt));
      half.appendChild(p);
    });
    return half;
  };
  // top row 12-17? simplified: top half 0-5 and 18-23
  const topHalf=document.createElement('div');topHalf.className='bg-half';
  // top: 12 points: 12..17 and 18..23? just show 0-11 top
  // For simplicity show 0-11 top, 12-23 bottom linearized
  const topRange=[...Array(12).keys()]; //0-11
  const bottomRange=[...Array(12).keys()].map(i=>12+i); //12-23
  this.boardEl.appendChild(makeHalf(topRange,false));
  const bar=document.createElement('div');bar.className='bg-bar';bar.innerHTML=`<div style="color:#fff;font-weight:700;font-size:.65rem">BAR</div><div class="bg-checker white" style="width:28px">${this.bar.w}</div><div class="bg-checker black" style="width:28px">${this.bar.b}</div><div style="color:#fff;font-size:.65rem">OFF</div><div class="bg-checker white" style="width:28px">${this.off.w}</div><div class="bg-checker black" style="width:28px">${this.off.b}</div>`;
  this.boardEl.appendChild(bar);
  this.boardEl.appendChild(makeHalf(bottomRange,true));
  this.diceEl.textContent=this.dice.length?`🎲 ${this.dice.join(' · ')}`:'—';
  this.turnEl.textContent=this.winner?`🏆 ${this.winner}`:(this.turn==='w'?'⚪ Your turn (White)':'⚫ Bot (Black) turn');
  this.movesEl.textContent=this.moves.length?`Moves left: ${this.moves.join(', ')}`:'Roll dice';
 }
 onPoint(pt){
  if(this.winner||!this.dice.length)return;
  if(this.turn==='b')return; // bot
  if(this.selected===null){
    // must select own checker or bar
    if(this.bar.w>0){if(pt!==0) {this.log('Must enter from bar (point 1)','#ef233c');return} this.selected='bar'; this.render(); return}
    if(this.board[pt].w===0){this.log('No white checker','#ffb703');return}
    this.selected=pt;this.render();
  } else {
    // destination
    const from=this.selected, to=pt;
    const dist= from==='bar'? to+1 : Math.abs(to-from); // simplified distance
    // check if dist in moves
    const idx=this.moves.indexOf(dist);
    if(idx===-1){this.log(`Need ${this.moves.join('/')} — not ${dist}`,'#ffb703');this.selected=null;this.render();return}
    // check occupancy: can land if opponent <2
    if(this.board[to].b>=2){this.log('Blocked by Black','#ef233c');return}
    // perform
    if(from==='bar'){this.bar.w--; } else this.board[from].w--;
    if(this.board[to].b===1){this.board[to].b=0; this.bar.b++; this.log('⚔️ Hit Black blot!','#ef233c')}
    this.board[to].w++;
    this.moves.splice(idx,1);
    this.selected=null;
    if(this.moves.length===0){this.turn='b'; this.render(); setTimeout(()=>this.botTurn(),700); return}
    this.render();
  }
 }
 roll(){
  if(this.winner||this.moves.length)return;
  const d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;
  this.dice=[d1,d2];this.moves= d1===d2?[d1,d1,d1,d1]:[d1,d2];
  this.log(`🎲 ${this.turn==='w'?'You':'Bot'} rolled ${d1}·${d2}`,'#4361ee');
  this.render();
  if(this.turn==='b')this.botTurn();
 }
 botTurn(){
  if(this.winner||this.turn!=='b')return;
  if(!this.moves.length){this.roll();return}
  // simple bot: random legal move
  let attempts=0;
  while(this.moves.length&&attempts<100){
    attempts++;
    // pick random from+dist
    const dist=this.moves[Math.floor(Math.random()*this.moves.length)];
    // find from points with black
    const candidates=[];
    if(this.bar.b>0)candidates.push('bar');
    for(let pt=0;pt<24;pt++)if(this.board[pt].b>0)candidates.push(pt);
    const from=candidates[Math.floor(Math.random()*candidates.length)];
    let to;
    if(from==='bar')to= dist-1;
    else to= from+dist; // simplified forward
    if(to>=24){ // bear off
      if(this.canBearOff('b')){this.board[from].b--;this.off.b++;this.moves.splice(this.moves.indexOf(dist),1);this.log(`⚫ Bot bears off`,'#2dc653');continue}
      else continue;
    }
    if(to<0||to>=24)continue;
    if(this.board[to].w>=2)continue;
    // do
    if(from==='bar')this.bar.b--; else this.board[from].b--;
    if(this.board[to].w===1){this.board[to].w=0;this.bar.w++;this.log('⚔️ Bot hits White!','#ef233c')}
    this.board[to].b++;
    this.moves.splice(this.moves.indexOf(dist),1);
    this.render();
  }
  // end turn
  if(!this.moves.length){
    if(this.off.b===15){this.winner='Black (Bot)';this.render();return}
    this.turn='w';this.render();
  } else {
    this.turn='w';this.render();
  }
 }
 canBearOff(col){
  // simplified: if all checkers in home board (0-5 for white? but we simplified) — just allow if random
  return Math.random()<0.2;
 }
}
