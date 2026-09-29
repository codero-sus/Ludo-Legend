/* ═════════════════════════════════════════════════════════════
   games/tiger/TigerGame.js — Aadu Puli Attam (Tiger & Goat)
   23-point board · 3 🐯 vs 15 🐐 · placement → capture/block
   Indian forest styled · Human (Goats) vs Bot (Tigers)
   ═════════════════════════════════════════════════════════════ */
const POINTS = [
  {x:500,y:60},   // 0 apex
  {x:260,y:200},  // 1
  {x:500,y:200},  // 2
  {x:740,y:200},  // 3
  {x:140,y:340},  // 4
  {x:320,y:340},  // 5
  {x:500,y:340},  // 6
  {x:680,y:340},  // 7
  {x:860,y:340},  // 8
  {x:140,y:500},  // 9
  {x:320,y:500},  //10
  {x:500,y:500},  //11 centre
  {x:680,y:500},  //12
  {x:860,y:500},  //13
  {x:140,y:660},  //14
  {x:320,y:660},  //15
  {x:500,y:660},  //16
  {x:680,y:660},  //17
  {x:860,y:660},  //18
  {x:140,y:820},  //19
  {x:320,y:820},  //20
  {x:680,y:820},  //21
  {x:860,y:820},  //22
];
// adjacency (undirected) — connects points that are one step apart
const ADJ = [
  [1,2,3],          //0
  [0,2,5,6],        //1
  [0,1,3,6],        //2
  [0,2,6,7],        //3
  [5,9],            //4
  [1,4,6,9,10],     //5
  [1,2,3,5,7,10,11,12], //6 centre top
  [3,6,8,12,13],    //7
  [7,13],           //8
  [4,5,10,14],      //9
  [5,6,9,11,14,15], //10
  [6,10,12,15,16,17], //11 centre
  [6,7,11,13,17,18], //12
  [7,8,12,18],      //13
  [9,10,15,19],     //14
  [10,11,14,16,19,20], //15
  [11,15,17,20],    //16
  [11,12,16,18,20,21], //17
  [12,13,17,22],    //18
  [14,15,20],       //19
  [15,16,17,19,21], //20 bottom centre
  [17,20,22],       //21
  [18,21],          //22  (asymmetric but playable)
];
// ensure symmetry
(function sym(){
  for(let i=0;i<ADJ.length;i++){
    for(const j of [...ADJ[i]]){
      if(!ADJ[j].includes(i)) ADJ[j].push(i);
    }
  }
})();

export class TigerGame{
  constructor(root){
    this.root=root;
    this.board = Array(POINTS.length).fill(null);
    this.goatsToPlace=15;
    this.goatsOnBoard=0;
    this.captured=0;
    this.turn='goat'; // goat places first
    this.selected=null;
    this.winner=null;
    this.vsBot=true;
  }
  init(){
    this.root.innerHTML=`
      <div class="tiger-layout">
        <div class="tiger-card">
          <div class="tiger-banner">🐯 Aadu Puli Attam <span style="opacity:.8;font-weight:400">· Tiger & Goat — Indian forest</span></div>
          <div class="tiger-board-wrap" id="tigerWrap"><svg id="tigerSvg" viewBox="0 0 1000 1000"></svg><div id="tigerLayer"></div></div>
          <div class="tiger-controls">
            <div style="flex:1">
              <div id="tigerTurn" style="font-family:var(--font-display);font-weight:700;color:#3a2410">Place goats — 15 to place</div>
              <div id="tigerHint" style="font-size:.82rem;color:#6d4a2a">Tap an empty point to place 🐐</div>
            </div>
            <button id="tigerRestart" class="ghost-btn" style="color:#3a2410;border-color:#c9a86a;background:#fff">🔄 Restart</button>
            <button id="tigerMode" class="chip-btn active" title="Toggle vs Bot / 2P">🤖 vs Bot</button>
          </div>
          <div id="tigerStats" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;font-size:.78rem;color:#5a3a1a"></div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block"><h3 class="panel-title">📜 Rules</h3>
            <div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>🐐 <b>Goats</b> place 15, then move 1 step to adjacent empty.</div>
              <div>🐯 <b>Tigers</b> move 1 step or capture by jumping over 🐐 to empty beyond.</div>
              <div>🐯 wins by capturing <b>5 goats</b>. 🐐 wins by blocking all tigers.</div>
              <div>⭐ You play Goats; Bot plays Tigers (toggle for 2P).</div>
            </div>
          </div>
          <div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="tigerLog" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;font-size:.82rem"></ol></div>
        </aside>
      </div>`;
    this.svg=this.root.querySelector('#tigerSvg');
    this.layer=this.root.querySelector('#tigerLayer');
    this.turnEl=this.root.querySelector('#tigerTurn');
    this.hintEl=this.root.querySelector('#tigerHint');
    this.logEl=this.root.querySelector('#tigerLog');
    this.statsEl=this.root.querySelector('#tigerStats');
    this.root.querySelector('#tigerRestart').addEventListener('click',()=>this.start());
    this.root.querySelector('#tigerMode').addEventListener('click',(e)=>{
      this.vsBot=!this.vsBot;
      e.currentTarget.textContent=this.vsBot?'🤖 vs Bot':'👥 2 Players';
      e.currentTarget.classList.toggle('active',this.vsBot);
      this.log(this.vsBot?'Mode: Goats (You) vs Tigers (Bot)':'Mode: 2 Players',' #ffd166');
      this.updateBanner();
    });
    this.renderBoard();
    this.start();
  }
  onShow(){ this.renderPieces(); }
  onHide(){}

  renderBoard(){
    const NS='http://www.w3.org/2000/svg';
    const svg=this.svg; svg.innerHTML='';
    const bg=document.createElementNS(NS,'rect');
    bg.setAttribute('x',0);bg.setAttribute('y',0);bg.setAttribute('width',1000);bg.setAttribute('height',1000);bg.setAttribute('rx',18);bg.setAttribute('fill','#fff7d6');
    svg.appendChild(bg);
    // lines
    for(let i=0;i<ADJ.length;i++){
      for(const j of ADJ[i]){
        if(j<=i) continue;
        const a=POINTS[i], b=POINTS[j];
        const l=document.createElementNS(NS,'line');
        l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);
        l.setAttribute('stroke','#8d5a2b');l.setAttribute('stroke-width',4);l.setAttribute('stroke-linecap','round');l.setAttribute('opacity',.9);
        svg.appendChild(l);
      }
    }
    // triangle highlight
    const tri=document.createElementNS(NS,'polygon');
    tri.setAttribute('points',`${POINTS[0].x},${POINTS[0].y} ${POINTS[1].x},${POINTS[1].y} ${POINTS[3].x},${POINTS[3].y}`);
    tri.setAttribute('fill','none');tri.setAttribute('stroke','#d4a017');tri.setAttribute('stroke-width',5);tri.setAttribute('opacity',.55);tri.setAttribute('stroke-linejoin','round');
    svg.appendChild(tri);
    // points
    POINTS.forEach((p,i)=>{
      const c=document.createElementNS(NS,'circle');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',26);
      c.setAttribute('class','tiger-point'); c.dataset.idx=i;
      c.addEventListener('click',()=>this.onPoint(i));
      svg.appendChild(c);
      const t=document.createElementNS(NS,'text');
      t.setAttribute('x',p.x);t.setAttribute('y',p.y+4);t.setAttribute('text-anchor','middle');t.setAttribute('font-size',10);t.setAttribute('fill','#8d5a2b');t.setAttribute('font-weight','700');t.setAttribute('pointer-events','none');
      t.textContent=i;
      svg.appendChild(t);
    });
    const frame=document.createElementNS(NS,'rect');
    frame.setAttribute('x',8);frame.setAttribute('y',8);frame.setAttribute('width',984);frame.setAttribute('height',984);frame.setAttribute('rx',14);frame.setAttribute('fill','none');frame.setAttribute('stroke','#d4a017');frame.setAttribute('stroke-width',6);frame.setAttribute('opacity',.7);
    svg.appendChild(frame);
  }

  start(){
    this.board=Array(POINTS.length).fill(null);
    // place 3 tigers at strong positions
    [0,4,8].forEach(i=> this.board[i]='tiger');
    this.goatsToPlace=15; this.goatsOnBoard=0; this.captured=0;
    this.turn='goat'; this.selected=null; this.winner=null;
    this.logEl.innerHTML='';
    this.log('🐯 Tigers placed at 0,4,8 — Goats to place 15',' #ffb703');
    this.renderPieces(); this.updateBanner(); this.updateStats();
  }

  log(msg, color=null){
    const li=document.createElement('li');
    li.textContent=msg;
    li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';
    if(color) li.style.borderLeftColor=color;
    this.logEl.prepend(li);
    while(this.logEl.children.length>12) this.logEl.lastChild.remove();
  }
  updateStats(){
    this.statsEl.innerHTML=`<span style="background:#fff;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px">🐐 On board: <b>${this.goatsOnBoard}</b> · To place: <b>${this.goatsToPlace}</b></span><span style="background:#ffd9de;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px">🐯 Captured: <b>${this.captured}/5</b></span><span style="background:#fff;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px">${this.winner? '🏆 '+this.winner : (this.turn==='goat'?'🐐 Goat turn':'🐯 Tiger turn')}</span>`;
  }
  updateBanner(){
    if(this.winner){
      this.turnEl.textContent=`🏆 ${this.winner} wins!`;
      this.hintEl.textContent='Click Restart to play again';
      return;
    }
    if(this.turn==='goat'){
      if(this.goatsToPlace>0){
        this.turnEl.textContent=`🐐 Place goat — ${this.goatsToPlace} left`;
        this.hintEl.textContent='Tap an empty point to place 🐐';
      } else {
        this.turnEl.textContent='🐐 Goat turn — move 1 step';
        this.hintEl.textContent=this.selected!=null ? 'Tap a green point to move' : 'Tap your 🐐 to select';
      }
    } else {
      this.turnEl.textContent='🐯 Tiger turn';
      this.hintEl.textContent= this.vsBot ? 'Bot thinking…' : (this.selected!=null ? 'Tap green (move) or red (capture)' : 'Tap a 🐯 to select');
    }
    this.updateStats();
    // highlight point affordances
    this.svg.querySelectorAll('.tiger-point').forEach(el=>{
      el.classList.remove('selected','legal','capture');
      const idx=Number(el.dataset.idx);
      if(idx===this.selected) el.classList.add('selected');
      else if(this.selected!=null){
        const cands=this.legalTargets(this.selected);
        if(cands.moves.includes(idx)) el.classList.add('legal');
        if(cands.captures.includes(idx)) el.classList.add('capture');
      } else if(this.turn==='goat' && this.goatsToPlace>0 && this.board[idx]==null){
        // hint placeable
        el.style.opacity='1';
      }
    });
  }

  legalTargets(from){
    const moves=[]; const captures=[];
    if(this.board[from]==null) return {moves,captures};
    const isTiger=this.board[from]==='tiger';
    for(const nb of ADJ[from]){
      if(this.board[nb]==null) moves.push(nb);
      // capture only for tiger: jump over goat
      if(isTiger && this.board[nb]==='goat'){
        // find continuation beyond nb in same direction
        const a=POINTS[from], b=POINTS[nb];
        const dx=b.x-a.x, dy=b.y-a.y;
        // find point collinear beyond nb
        for(const cand of ADJ[nb]){
          if(cand===from) continue;
          const c=POINTS[cand];
          // check collinearity approx: vector nb->cand should be same dir as from->nb
          const dx2=c.x-b.x, dy2=c.y-b.y;
          // dot product and cross
          const sameDir = (Math.sign(dx)===Math.sign(dx2) || dx===0) && (Math.sign(dy)===Math.sign(dy2) || dy===0);
          const cross=Math.abs(dx*dy2 - dy*dx2);
          const distMatch=Math.abs(Math.hypot(dx,dy)-Math.hypot(dx2,dy2))<60;
          // simpler: if cand adjacent to nb and not from, and lies roughly opposite, allow
          // Use distance & collinear check relaxed
          const collinear = cross< 4000;
          if(sameDir && collinear && distMatch && this.board[cand]==null){
            captures.push(cand);
          }
        }
      }
    }
    // de-dup
    return {moves:[...new Set(moves)], captures:[...new Set(captures)]};
  }

  allTigerMoves(){
    const out=[];
    for(let i=0;i<this.board.length;i++) if(this.board[i]==='tiger'){
      const {moves,captures}=this.legalTargets(i);
      moves.forEach(to=> out.push({from:i,to,capture:false}));
      captures.forEach(to=> out.push({from:i,to,capture:true}));
    }
    return out;
  }
  tigersBlocked(){
    return this.allTigerMoves().length===0;
  }

  checkWin(){
    if(this.captured>=5){ this.winner='🐯 Tigers'; this.log('🏆 Tigers win! 5 goats captured',' #ef233c'); return true; }
    if(this.goatsToPlace===0 && this.tigersBlocked()){ this.winner='🐐 Goats'; this.log('🏆 Goats win! Tigers blocked',' #2dc653'); return true; }
    return false;
  }

  onPoint(idx){
    if(this.winner) return;
    // placement phase for goats
    if(this.turn==='goat' && this.goatsToPlace>0){
      if(this.board[idx]!=null){ this.log('Occupied! Choose empty',' #ffb703'); return; }
      this.board[idx]='goat';
      this.goatsToPlace--; this.goatsOnBoard++;
      this.log(`🐐 Goat placed at ${idx} (${this.goatsToPlace} left)`,' #2dc653');
      this.selected=null;
      if(this.checkWin()){ this.renderPieces(); this.updateBanner(); return; }
      // after placement, turn to tiger unless goats still placing? Classic alternates: goat places, tiger moves. We alternate each placement.
      this.turn='tiger';
      this.renderPieces(); this.updateBanner();
      if(this.vsBot) setTimeout(()=>this.botTiger(), 500);
      return;
    }
    // movement phase
    const piece=this.board[idx];
    // if clicking own piece, select
    const own = this.turn==='goat' ? 'goat' : 'tiger';
    if(piece===own){
      this.selected=idx;
      this.updateBanner();
      this.renderPieces();
      return;
    }
    // if have selection and clicked target
    if(this.selected!=null){
      const {moves,captures}=this.legalTargets(this.selected);
      const isMove=moves.includes(idx);
      const isCap=captures.includes(idx);
      if(!isMove && !isCap){
        // maybe select other own piece?
        if(piece===own) { this.selected=idx; this.updateBanner(); this.renderPieces(); }
        return;
      }
      // execute move
      const from=this.selected;
      const mover=this.board[from];
      // capture handling: find mid point goat to remove
      if(isCap){
        // find jumped point
        let mid=-1;
        for(const nb of ADJ[from]){
          if(this.board[nb]!=='goat') continue;
          const a=POINTS[from], b=POINTS[nb], c=POINTS[idx];
          const dx=b.x-a.x, dy=b.y-a.y, dx2=c.x-b.x, dy2=c.y-b.y;
          const cross=Math.abs(dx*dy2 - dy*dx2);
          const sameDir=(Math.sign(dx)===Math.sign(dx2)||dx===0)&&(Math.sign(dy)===Math.sign(dy2)||dy===0);
          if(sameDir && cross<4000 && ADJ[nb].includes(idx)){
            mid=nb; break;
          }
        }
        if(mid!==-1){ this.board[mid]=null; this.captured++; this.goatsOnBoard--; this.log(`🐯 Capture! Tiger ${from} → ${idx} (goat at ${mid})`,' #ef233c'); }
      } else {
        this.log(`${mover==='goat'?'🐐':'🐯'} ${from} → ${idx}`,' #5a3a1a');
      }
      this.board[idx]=mover; this.board[from]=null;
      this.selected=null;
      if(this.checkWin()){ this.renderPieces(); this.updateBanner(); return; }
      // switch turn
      if(this.turn==='goat'){
        this.turn='tiger';
        this.renderPieces(); this.updateBanner();
        if(this.vsBot) setTimeout(()=>this.botTiger(), 500);
      } else {
        // tiger just moved
        if(this.goatsToPlace>0){
          this.turn='goat'; // still have placements but we already handled placements above
        } else {
          this.turn='goat';
        }
        this.renderPieces(); this.updateBanner();
      }
      return;
    }
    // no selection, clicked empty or opponent — hint
    if(this.turn==='goat' && this.goatsToPlace===0){
      this.log('Select your 🐐 first',' #ffb703');
    }
  }

  botTiger(){
    if(this.winner || this.turn!=='tiger') return;
    const moves=this.allTigerMoves();
    if(moves.length===0){ this.checkWin(); this.renderPieces(); this.updateBanner(); return; }
    // prefer captures, else most blocking
    let pick=null;
    const caps=moves.filter(m=>m.capture);
    if(caps.length) pick=caps[Math.floor(Math.random()*caps.length)];
    else pick=moves[Math.floor(Math.random()*moves.length)];
    // execute
    const from=pick.from, to=pick.to;
    if(pick.capture){
      let mid=-1;
      for(const nb of ADJ[from]){
        if(this.board[nb]!=='goat') continue;
        if(ADJ[nb].includes(to)){
          const a=POINTS[from], b=POINTS[nb], c=POINTS[to];
          const dx=b.x-a.x, dy=b.y-a.y, dx2=c.x-b.x, dy2=c.y-b.y;
          const cross=Math.abs(dx*dy2 - dy*dx2);
          const sameDir=(Math.sign(dx)===Math.sign(dx2)||dx===0)&&(Math.sign(dy)===Math.sign(dy2)||dy===0);
          if(sameDir && cross<4000){ mid=nb; break; }
        }
      }
      if(mid!==-1){ this.board[mid]=null; this.captured++; this.goatsOnBoard--; this.log(`🤖 🐯 captures ${from}→${to} (goat ${mid})`,' #ef233c'); }
    } else {
      this.log(`🤖 🐯 ${from}→${to}`,' #ffb703');
    }
    this.board[to]='tiger'; this.board[from]=null;
    if(this.checkWin()){ this.renderPieces(); this.updateBanner(); return; }
    this.turn='goat';
    this.renderPieces(); this.updateBanner();
  }

  renderPieces(){
    this.layer.innerHTML='';
    POINTS.forEach((p,i)=>{
      const v=this.board[i];
      if(!v) return;
      const el=document.createElement('div');
      el.className=`tiger-piece ${v}`;
      el.style.left=`${p.x/10}%`;
      el.style.top=`${p.y/10}%`;
      el.textContent=v==='tiger'?'🐯':'🐐';
      if(i===this.selected) el.classList.add('selected');
      el.addEventListener('click',()=>this.onPoint(i));
      this.layer.appendChild(el);
    });
  }
}
