/* ═════════════════════════════════════════════════════════════
   games/tambola/TambolaGame.js — Tambola / Housie (Indian Bingo)
   1-90 caller, 3×9 ticket (5 nums/row), Early 5 / Lines / Full House
   vs 3 bots, auto-mark, prize claims — festival styled
   ═════════════════════════════════════════════════════════════ */
function generateTicket(){
  // 3x9 grid, col ranges
  const colRanges=[[1,9],[10,19],[20,29],[30,39],[40,49],[50,59],[60,69],[70,79],[80,90]];
  const ticket=Array.from({length:3},()=>Array(9).fill(null));
  // decide per column how many numbers (1-3) total 15 numbers (5 per row)
  // strategy: generate 15 positions ensuring 5 per row and 1-3 per col, at least 1 per col? not required but 5 per row
  // simple algorithm: start with all cols 1 each? That gives 9 numbers, need 6 more. Add randomly ensuring col count <=3 and row count <=5
  const colCount=Array(9).fill(1);
  // add 6 extra numbers
  let extra=6;
  while(extra>0){
    const col=Math.floor(Math.random()*9);
    if(colCount[col]<3) { colCount[col]++; extra--; }
  }
  // now colCount sum 15, each 1-3
  // Now assign numbers to rows per column
  const rowCount=[0,0,0];
  // For each col, choose rows
  const colRows=[];
  for(let c=0;c<9;c++){
    const k=colCount[c];
    let rows=[];
    if(k===1) rows=[Math.floor(Math.random()*3)];
    else if(k===2){
      const a=Math.floor(Math.random()*3);
      let b;
      do{ b=Math.floor(Math.random()*3); }while(b===a);
      rows=[a,b].sort((x,y)=>x-y);
    } else rows=[0,1,2];
    colRows.push(rows);
    rows.forEach(r=>rowCount[r]++);
  }
  // rowCount should be 5 each ideally, but random may not give 5. If not, regenerate
  if(!rowCount.every(v=>v===5)){
    return generateTicket();
  }
  // Now fill numbers sorted within column top to bottom
  for(let c=0;c<9;c++){
    const [low,high]=colRanges[c];
    const k=colCount[c];
    // pick k distinct numbers in range sorted
    const pool=[];
    for(let n=low;n<=high;n++) pool.push(n);
    const picks=[];
    for(let i=0;i<k;i++){
      const idx=Math.floor(Math.random()*pool.length);
      picks.push(pool.splice(idx,1)[0]);
    }
    picks.sort((a,b)=>a-b);
    const rows=colRows[c];
    rows.forEach((r,i)=> ticket[r][c]=picks[i]);
  }
  return ticket;
}

function ticketNumbers(ticket){
  const out=[];
  for(let r=0;r<3;r++) for(let c=0;c<9;c++) if(ticket[r][c]!=null) out.push(ticket[r][c]);
  return out;
}

const PRIZES=[
  {id:'early5', label:'Early 5', check:(t,marked)=> marked.size>=5 && [...marked].filter(n=> ticketNumbers(t).includes(n)).length>=5 && ticketNumbers(t).filter(n=>marked.has(n)).length>=5 && countMarked(t,marked)>=5},
  {id:'top', label:'Top Line', check:(t,marked)=> rowDone(t,marked,0)},
  {id:'middle', label:'Middle Line', check:(t,marked)=> rowDone(t,marked,1)},
  {id:'bottom', label:'Bottom Line', check:(t,marked)=> rowDone(t,marked,2)},
  {id:'corners', label:'Corners', check:(t,marked)=>{
    const corners=[t[0][0]!=null?t[0][0]:null, t[0][8]!=null?t[0][8]:null, t[2][0]!=null?t[2][0]:null, t[2][8]!=null?t[2][8]:null].filter(v=>v!=null);
    // if corners not all present (some null), use first/last non-null per row
    if(corners.length<4){
      const c=[];
      for(let r of [0,2]) for(let c0 of [0,8]){
        // find first non-null in row from that side?
      }
    }
    return corners.length>0 && corners.every(n=>marked.has(n));
  }},
  {id:'full', label:'Full House', check:(t,marked)=> ticketNumbers(t).every(n=>marked.has(n))},
];
function rowDone(ticket,marked,row){
  const cells=ticket[row].filter(v=>v!=null);
  return cells.length>0 && cells.every(n=>marked.has(n));
}
function countMarked(ticket,marked){
  return ticketNumbers(ticket).filter(n=>marked.has(n)).length;
}

export class TambolaGame{
  constructor(root){
    this.root=root;
    this.callOrder=[]; this.called=new Set(); this.recent=null;
    this.playerTicket=null; this.botTickets=[];
    this.marked=new Set(); this.botMarked=[];
    this.prizesClaimed=new Set(); this.botPrizes=[];
    this.timer=null; this.auto=false; this.winner=null;
  }
  init(){
    this.root.innerHTML=`
      <div class="tambola-layout">
        <div class="tambola-card">
          <div class="tambola-banner">🎱 Tambola — Housie <span style="opacity:.8;font-weight:400">· Indian Bingo 1-90</span></div>
          <div class="tambola-caller">
            <div class="tambola-ball" id="tambolaBall">—</div>
            <div style="flex:1">
              <div id="tambolaTurn" style="font-family:var(--font-display);font-weight:700;color:#1a0f2e">Press Call to start</div>
              <div id="tambolaHint" style="font-size:.82rem;color:#5b5175">You vs 3 bots · 1-90 · First to claim wins</div>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="tambolaCall" class="gold-btn" style="padding:9px 18px">📢 Call</button>
                <button id="tambolaAuto" class="ghost-btn" style="color:#1a0f2e;border-color:#c9b48a;background:#fff">▶ Auto</button>
                <button id="tambolaNew" class="ghost-btn" style="color:#1a0f2e;border-color:#c9b48a;background:#fff">🔄 New Tickets</button>
              </div>
            </div>
          </div>
          <div id="tambolaBoard" class="tambola-board"></div>
          <div style="font-family:var(--font-display);font-weight:700;color:#1a0f2e;margin-bottom:6px">🎟 Your Ticket</div>
          <div id="tambolaTicket" class="tambola-ticket"></div>
          <div id="tambolaPrizes" class="tambola-status"></div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block"><h3 class="panel-title">🏆 Prizes</h3>
            <div id="tambolaPrizeList" style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>⚡ Early 5 — first 5 numbers</div>
              <div>➖ Top / Middle / Bottom Line</div>
              <div>🔷 Corners — 4 corners</div>
              <div>🏠 Full House — all 15</div>
            </div>
          </div>
          <div class="panel-block"><h3 class="panel-title">🤖 Bots</h3><div id="tambolaBots" style="display:flex;flex-direction:column;gap:8px"></div></div>
          <div class="panel-block"><h3 class="panel-title">📜 Calls</h3><ol id="tambolaLog" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;font-size:.82rem"></ol></div>
        </aside>
      </div>`;
    this.ball=this.root.querySelector('#tambolaBall');
    this.boardEl=this.root.querySelector('#tambolaBoard');
    this.ticketEl=this.root.querySelector('#tambolaTicket');
    this.prizesEl=this.root.querySelector('#tambolaPrizes');
    this.turnEl=this.root.querySelector('#tambolaTurn');
    this.hintEl=this.root.querySelector('#tambolaHint');
    this.logEl=this.root.querySelector('#tambolaLog');
    this.botsEl=this.root.querySelector('#tambolaBots');
    this.root.querySelector('#tambolaCall').addEventListener('click',()=>this.call());
    this.root.querySelector('#tambolaAuto').addEventListener('click',(e)=>this.toggleAuto(e.currentTarget));
    this.root.querySelector('#tambolaNew').addEventListener('click',()=>this.newGame());
    this.newGame();
  }
  onShow(){}
  onHide(){ this.stopAuto(); }

  newGame(){
    this.stopAuto();
    this.called=new Set(); this.recent=null; this.winner=null;
    this.callOrder=[...Array(90)].map((_,i)=>i+1).sort(()=>Math.random()-0.5);
    this.playerTicket=generateTicket();
    this.botTickets=[generateTicket(),generateTicket(),generateTicket()];
    this.marked=new Set();
    this.botMarked=[new Set(),new Set(),new Set()];
    this.prizesClaimed=new Set();
    this.botPrizes=[new Set(),new Set(),new Set()];
    this.logEl.innerHTML='';
    this.ball.textContent='—'; this.ball.classList.remove('pulse');
    this.turnEl.textContent='New tickets dealt — press Call!';
    this.hintEl.textContent='Your ticket below · Auto-marks on call';
    this.renderBoard(); this.renderTicket(); this.renderBots(); this.renderPrizes();
    this.log('🎟 New Housie — 1-90, 3 bots, good luck!',' #ffb703');
  }
  renderBoard(){
    this.boardEl.innerHTML='';
    for(let n=1;n<=90;n++){
      const d=document.createElement('div');
      d.className='tambola-num'+(this.called.has(n)?' called':'')+(n===this.recent?' recent':'');
      d.textContent=n;
      this.boardEl.appendChild(d);
    }
  }
  renderTicket(){
    this.ticketEl.innerHTML='';
    for(let r=0;r<3;r++){
      const row=document.createElement('div'); row.className='tambola-row';
      for(let c=0;c<9;c++){
        const cell=document.createElement('div');
        const v=this.playerTicket[r][c];
        if(v==null){ cell.className='tambola-cell empty'; }
        else {
          const isMarked=this.marked.has(v);
          cell.className='tambola-cell'+(isMarked?' marked':'');
          cell.textContent=v;
        }
        row.appendChild(cell);
      }
      this.ticketEl.appendChild(row);
    }
  }
  renderBots(){
    const names=['Aarav','Priya','Kabir'];
    this.botsEl.innerHTML='';
    this.botTickets.forEach((t,i)=>{
      const marked=this.botMarked[i];
      const cnt=countMarked(t,marked);
      const div=document.createElement('div');
      div.style.cssText='background:rgba(255,255,255,.07);border-radius:10px;padding:8px 10px;border:1px solid rgba(255,209,102,.15)';
      div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:#fff">${['🦁','🦚','🐯'][i]} ${names[i]}</span><span style="font-weight:800;color:var(--gold)">${cnt}/15</span></div><div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${[...this.botPrizes[i]].map(p=>`<span class="tambola-badge done">${p}</span>`).join('') || '<span style="font-size:.72rem;color:rgba(255,255,255,.55)">No prize yet</span>'}</div>`;
      this.botsEl.appendChild(div);
    });
  }
  renderPrizes(){
    const all=[{id:'early5',label:'Early 5'},{id:'top',label:'Top'},{id:'middle',label:'Middle'},{id:'bottom',label:'Bottom'},{id:'full',label:'Full House'}];
    this.prizesEl.innerHTML=all.map(p=>{
      const done=this.prizesClaimed.has(p.id);
      const botDone=this.botPrizes.some(s=>s.has(p.id));
      return `<span class="tambola-badge ${done?'done':''}" title="${botDone?'Bot claimed':''}">${done?'✓ ':''}${p.label}${botDone && !done?' · Bot':''}</span>`;
    }).join('');
  }
  log(msg,color=null){
    const li=document.createElement('li');
    li.textContent=msg;
    li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';
    if(color) li.style.borderLeftColor=color;
    this.logEl.prepend(li);
    while(this.logEl.children.length>14) this.logEl.lastChild.remove();
  }
  checkPrizes(ticket,marked,claimedSet,owner){
    for(const pz of PRIZES){
      if(claimedSet.has(pz.id)) continue;
      if(pz.check(ticket,marked)){
        claimedSet.add(pz.id);
        this.log(`🏆 ${owner} claims ${pz.label}!`,' #2dc653');
        // check win? first full house wins game
        if(pz.id==='full'){
          this.winner=owner;
          this.turnEl.textContent=`🏆 ${owner} — Full House!`;
          this.hintEl.textContent='Game over — New Tickets to play again';
          this.stopAuto();
          this.renderPrizes(); this.renderBots();
          return true;
        }
      }
    }
    return false;
  }
  call(){
    if(this.winner){ this.log('Game over — New Tickets',' #ffb703'); return; }
    if(this.callOrder.length===0){ this.log('All 90 called!',' #ffb703'); return; }
    const n=this.callOrder.shift();
    this.called.add(n); this.recent=n;
    this.ball.textContent=n; this.ball.classList.remove('pulse'); void this.ball.offsetWidth; this.ball.classList.add('pulse');
    this.log(`📢 ${n} called (${this.called.size}/90)`,' #4361ee');
    this.turnEl.textContent=`📢 ${n} — ${this.called.size}/90`;
    // auto mark
    if(ticketNumbers(this.playerTicket).includes(n)) { this.marked.add(n); this.log(`✓ Your ticket has ${n}`,' #2dc653'); }
    this.botTickets.forEach((t,i)=>{
      if(ticketNumbers(t).includes(n)) this.botMarked[i].add(n);
    });
    // check prizes: player first then bots
    this.checkPrizes(this.playerTicket,this.marked,this.prizesClaimed,'You');
    this.botTickets.forEach((t,i)=>{
      this.checkPrizes(t,this.botMarked[i],this.botPrizes[i],['Aarav','Priya','Kabir'][i]);
    });
    this.renderBoard(); this.renderTicket(); this.renderBots(); this.renderPrizes();
    if(this.winner){
      this.log(`🏁 ${this.winner} wins the Housie!`,' #ffd166');
    }
  }
  toggleAuto(btn){
    this.auto=!this.auto;
    btn.textContent=this.auto?'⏸ Pause':'▶ Auto';
    btn.classList.toggle('active',this.auto);
    if(this.auto){
      this.hintEl.textContent='Auto calling every 1.1s…';
      this.timer=setInterval(()=>this.call(), 1100);
    } else {
      this.stopAuto();
      this.hintEl.textContent='Auto paused — press Call';
    }
  }
  stopAuto(){
    this.auto=false;
    if(this.timer){ clearInterval(this.timer); this.timer=null; }
    const btn=this.root.querySelector('#tambolaAuto');
    if(btn){ btn.textContent='▶ Auto'; btn.classList.remove('active'); }
  }
}
