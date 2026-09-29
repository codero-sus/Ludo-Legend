/* ═════════════════════════════════════════════════════════════
   games/mancala/MancalaGame.js — Pallanguzhi (South Indian Mancala)
   2 players, 7 pits + store each, 6 seeds per pit
   Sowing, capture, extra turn — wooden teak styled
   ═════════════════════════════════════════════════════════════ */
const PITS = 7; // per player
const SEEDS_INIT = 6;

export class MancalaGame{
  constructor(root){
    this.root=root;
    this.board=[]; // 14 pits + 2 stores? we use 14 pits (0-6 P1, 7-13 P2) + stores [0]=P1 store, [1]=P2 store
    this.stores=[0,0];
    this.turn=0; // 0 = player, 1 = opponent/bot
    this.winner=null;
    this.animating=false;
    this.vsBot=true;
  }
  init(){
    this.root.innerHTML=`
      <div class="mancala-layout">
        <div class="mancala-card">
          <div class="mancala-banner">🫘 Pallanguzhi <span style="opacity:.8;font-weight:400">· South Indian Mancala — 7 pits</span></div>
          <div class="mancala-board" id="mancalaBoard">
            <div class="mancala-store" id="store1"><div style="font-size:.75rem;color:#5a3200;font-weight:700">P2</div><div class="count" id="storeCount1">0</div><div style="font-size:.7rem;color:#8d5a2b">Store</div></div>
            <div class="mancala-pits" id="mancalaPits"></div>
            <div class="mancala-store" id="store0"><div style="font-size:.75rem;color:#5a3200;font-weight:700">P1</div><div class="count" id="storeCount0">0</div><div style="font-size:.7rem;color:#8d5a2b">Store</div></div>
          </div>
          <div class="mancala-controls">
            <div style="flex:1">
              <div id="mancalaTurn" style="font-family:var(--font-display);font-weight:700;color:#3a2410">Your turn</div>
              <div id="mancalaHint" style="font-size:.82rem;color:#6d4a2a">Tap a pit on your side (bottom row) to sow</div>
            </div>
            <button id="mancalaRestart" class="ghost-btn" style="color:#3a2410;border-color:#c9a86a;background:#fff">🔄 Restart</button>
            <button id="mancalaMode" class="chip-btn active">🤖 vs Bot</button>
          </div>
          <div id="mancalaStatus" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"></div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block"><h3 class="panel-title">📜 Rules</h3>
            <div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>🫘 Pick a pit on your side — sow one seed per pit clockwise.</div>
              <div>🏦 Land in your store → extra turn.</div>
              <div>✨ Land in empty own pit → capture opposite + yours to store.</div>
              <div>🏆 Game ends when one side empty — store with most wins.</div>
            </div>
          </div>
          <div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="mancalaLog" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;font-size:.82rem"></ol></div>
        </aside>
      </div>`;
    this.boardEl=this.root.querySelector('#mancalaPits');
    this.turnEl=this.root.querySelector('#mancalaTurn');
    this.hintEl=this.root.querySelector('#mancalaHint');
    this.logEl=this.root.querySelector('#mancalaLog');
    this.statusEl=this.root.querySelector('#mancalaStatus');
    this.root.querySelector('#mancalaRestart').addEventListener('click',()=>this.start());
    this.root.querySelector('#mancalaMode').addEventListener('click',(e)=>{
      this.vsBot=!this.vsBot;
      e.currentTarget.textContent=this.vsBot?'🤖 vs Bot':'👥 2 Players';
      e.currentTarget.classList.toggle('active',this.vsBot);
      this.updateBanner();
    });
    this.start();
  }
  onShow(){}
  onHide(){}
  start(){
    this.board=Array(PITS*2).fill(SEEDS_INIT);
    this.stores=[0,0];
    this.turn=0; this.winner=null; this.animating=false;
    this.logEl.innerHTML='';
    this.log('🫘 Pallanguzhi — 7 pits × 6 seeds. You are P1 (bottom).', '#ffb703');
    this.render();
    this.updateBanner();
  }
  log(msg,color=null){
    const li=document.createElement('li');
    li.textContent=msg;
    li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';
    if(color) li.style.borderLeftColor=color;
    this.logEl.prepend(li);
    while(this.logEl.children.length>12) this.logEl.lastChild.remove();
  }
  render(){
    this.boardEl.innerHTML='';
    // pits layout: top row P2 (7-13 right to left), bottom row P1 (0-6 left to right)
    // grid 7 cols x 2 rows
    const order = [7,8,9,10,11,12,13, 6,5,4,3,2,1,0]; // wait grid is 7x2, but we display 2 rows
    // Actually simpler: create 14 pits in DOM order matching visual: row0 = P2 pits 13..7 ? Use CSS grid 7 cols 2 rows.
    // We'll create in grid order: first 7 = top row (P2 from left to right as 13..7? Indian board mirrors)
    // Let's define top row left->right = 13,12,11,10,9,8,7 ; bottom row left->right =0,1,2,3,4,5,6
    const top = [13,12,11,10,9,8,7];
    const bottom=[0,1,2,3,4,5,6];
    const all=[...top,...bottom];
    all.forEach(idx=>{
      const pit=document.createElement('div');
      const isOwn = this.turn===0 ? idx<7 : idx>=7;
      const empty = this.board[idx]===0;
      pit.className='mancala-pit'+(empty?' empty':'')+(isOwn && !empty && !this.winner ? ' active':'');
      pit.dataset.idx=idx;
      pit.innerHTML=`<div class="pit-count">${this.board[idx]}</div>`;
      // seeds dots (max show 12)
      const seedsWrap=document.createElement('div');
      seedsWrap.className='pit-seeds';
      const n=Math.min(this.board[idx],18);
      for(let i=0;i<n;i++){
        const s=document.createElement('span'); s.className='mancala-seed'; seedsWrap.appendChild(s);
      }
      pit.appendChild(seedsWrap);
      // label
      const lbl=document.createElement('div');
      lbl.style.cssText='position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:.6rem;color:#8d5a2b;font-weight:700';
      lbl.textContent = idx<7 ? `P1·${idx+1}` : `P2·${idx-6}`;
      pit.appendChild(lbl);
      pit.addEventListener('click',()=>this.onPit(idx));
      this.boardEl.appendChild(pit);
    });
    this.root.querySelector('#storeCount0').textContent=this.stores[0];
    this.root.querySelector('#storeCount1').textContent=this.stores[1];
    this.statusEl.innerHTML=`<span style="background:#fff;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px;font-size:.78rem;color:#5a3200">🏦 P1 Store <b>${this.stores[0]}</b></span><span style="background:#fff;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px;font-size:.78rem;color:#5a3200">🏦 P2 Store <b>${this.stores[1]}</b></span><span style="background:${this.turn===0?'#2dc653':'#fff'};color:${this.turn===0?'#fff':'#5a3200'};border:1px solid #c9a86a;border-radius:20px;padding:4px 10px;font-size:.78rem">${this.turn===0?'● Your turn':'○ Bot turn'}</span>`;
  }
  updateBanner(){
    if(this.winner){
      this.turnEl.textContent=`🏆 ${this.winner} wins!`;
      this.hintEl.textContent='Click Restart for new game';
      return;
    }
    if(this.turn===0){
      this.turnEl.textContent='🫘 Your turn (P1 — bottom)';
      this.hintEl.textContent='Tap a pit on your side to sow';
    } else {
      this.turnEl.textContent=this.vsBot?'🤖 Bot thinking…':'🫘 P2 turn (top)';
      this.hintEl.textContent=this.vsBot?'Bot will move shortly':'P2 — tap a top pit';
    }
  }
  isOwnPit(idx, player){ return player===0 ? idx<7 : idx>=7; }
  opposite(idx){
    // opposite mapping: 0<->13,1<->12,2<->11,3<->10,4<->9,5<->8,6<->7
    const map=[13,12,11,10,9,8,7,6,5,4,3,2,1,0];
    return map[idx];
  }
  checkEnd(){
    const p1Empty = this.board.slice(0,7).every(v=>v===0);
    const p2Empty = this.board.slice(7,14).every(v=>v===0);
    if(p1Empty || p2Empty){
      // collect remaining to stores
      for(let i=0;i<7;i++){ this.stores[0]+=this.board[i]; this.board[i]=0; }
      for(let i=7;i<14;i++){ this.stores[1]+=this.board[i]; this.board[i]=0; }
      this.render();
      if(this.stores[0]>this.stores[1]) this.winner='P1 (You)';
      else if(this.stores[1]>this.stores[0]) this.winner=this.vsBot?'Bot (P2)':'P2';
      else this.winner='Draw';
      this.log(`🏁 Game over — P1 ${this.stores[0]} : ${this.stores[1]} P2 → ${this.winner} wins!`, '#2dc653');
      this.updateBanner();
      return true;
    }
    return false;
  }
  async sow(from){
    if(this.animating || this.winner) return false;
    if(this.board[from]===0) { this.log('Empty pit! Pick another',' #ffb703'); return false; }
    if(!this.isOwnPit(from,this.turn)) { this.log('Not your side!',' #ef233c'); return false; }
    this.animating=true;
    let seeds=this.board[from];
    this.board[from]=0;
    this.log(`${this.turn===0?'You':'P2'} sows ${seeds} from pit ${from<7?from+1:from-6} (${this.turn===0?'P1':'P2'})`, this.turn===0?'#2dc653':'#4361ee');
    let pos=from;
    let lastPos=null;
    let lastIsStore=false;
    // sow clockwise: order pits 0..6 (P1 left→right), then store0, then pits 7..13? Actually clockwise around board:
    // Our board circle: ... Let's define sow order: 0,1,2,3,4,5,6, store0, 7,8,9,10,11,12,13, store1, loop
    // But P1's turn skips opponent store, P2 skips P1 store.
    // Build sequence
    while(seeds>0){
      // advance
      pos = this.nextPos(pos, this.turn);
      // if pos is store
      if(pos==='s0' || pos==='s1'){
        if(pos==='s0' && this.turn===0){ this.stores[0]++; lastPos='s0'; lastIsStore=true; seeds--; }
        else if(pos==='s1' && this.turn===1){ this.stores[1]++; lastPos='s1'; lastIsStore=true; seeds--; }
        else { /* skip opponent store */ lastIsStore=false; continue; }
      } else {
        this.board[pos]++; lastPos=pos; lastIsStore=false; seeds--;
      }
      this.render();
      await new Promise(r=>setTimeout(r, 280));
    }
    // capture check
    if(!lastIsStore && lastPos!==null && this.isOwnPit(lastPos,this.turn) && this.board[lastPos]===1){
      const opp=this.opposite(lastPos);
      if(this.board[opp]>0){
        const cap=this.board[opp]+1;
        this.board[opp]=0; this.board[lastPos]=0;
        this.stores[this.turn]+=cap;
        this.log(`✨ Capture! Pit ${lastPos<7?lastPos+1:lastPos-6} + opposite → +${cap} to store`, '#ffb703');
        this.render();
        await new Promise(r=>setTimeout(r,300));
      }
    }
    if(this.checkEnd()){ this.animating=false; return true; }
    // extra turn?
    if(lastIsStore){
      this.log('🏦 Landed in store — extra turn!', '#ffd166');
      this.animating=false;
      this.updateBanner();
      this.render();
      if(this.turn===1 && this.vsBot) setTimeout(()=>this.botMove(), 700);
      return true;
    }
    // switch turn
    this.turn=1-this.turn;
    this.updateBanner();
    this.render();
    this.animating=false;
    if(this.turn===1 && this.vsBot && !this.winner) setTimeout(()=>this.botMove(), 700);
    return true;
  }
  nextPos(pos, player){
    // pos can be number pit idx or 's0'/'s1'
    // order array loop
    const order=['0','1','2','3','4','5','6','s0','7','8','9','10','11','12','13','s1'];
    let idx;
    if(pos==='s0') idx=7;
    else if(pos==='s1') idx=15;
    else idx=order.indexOf(String(pos));
    let nxt = order[(idx+1)%order.length];
    if(nxt==='s0' || nxt==='s1') return nxt;
    return Number(nxt);
  }
  onPit(idx){
    if(this.winner || this.animating) return;
    if(this.turn===1 && this.vsBot) return; // bot turn
    this.sow(idx);
  }
  botMove(){
    if(this.winner || this.animating || this.turn!==1) return;
    // simple greedy: prefer extra turn, then capture, then max seeds
    const candidates=[7,8,9,10,11,12,13].filter(i=>this.board[i]>0);
    if(!candidates.length){ this.checkEnd(); return; }
    let best=candidates[0], bestScore=-1;
    for(const c of candidates){
      // simulate quickly without anim
      let score=this.board[c];
      // check if would land in store
      let pos=c, seeds=this.board[c], last=null;
      while(seeds>0){
        pos=this.nextPos(pos,1);
        if(pos==='s1'){ seeds--; last='s1'; if(seeds===0) score+=20; }
        else if(pos==='s0'){ /* skip */ }
        else { seeds--; last=pos; }
      }
      if(typeof last==='number' && this.isOwnPit(last,1) && this.board[last]===0){
        const opp=this.opposite(last);
        if(this.board[opp]>0) score+= this.board[opp]+4;
      }
      if(score>bestScore){ bestScore=score; best=c; }
    }
    this.sow(best);
  }
}
