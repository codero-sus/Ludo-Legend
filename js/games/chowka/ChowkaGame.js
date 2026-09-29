/* ═════════════════════════════════════════════════════════════
   games/chowka/ChowkaGame.js — Chowka Bhara / Ashta Chamma
   5×5 cross board, 4 tokens per player, 4 cowries (1,2,3,4,8)
   Safe ⭐, capture, exact home — Indian teak & ivory
   Simplified: 32-track + 5 home per player, 2 players (You vs Bot)
   ═════════════════════════════════════════════════════════════ */
const COWRIE_MAP = [8,1,2,3,4]; // 0 up =8, 1=1 ... (random 0-4)
// Track: outer loop 32 squares (clockwise) + extra inner?
// We define board coords for 5x5 =25 squares. For playability we use track of 32 positions around perimeter + crosses.
// Simpler: use linear track 0-31 around, plus home stretch 32-36 per player, home=36
// Map track index -> svg x,y

function buildTrack(){
  const pts=[];
  // 5x5 grid coords 0..4 => svg 100..900
  const toXY=(r,c)=>({x: 120 + c*190, y:120 + r*190});
  // track order clockwise around 5x5 perimeter + inner cross?
  // We'll define track as: start at (2,0) left middle, go around outer ring clockwise, then inner cross leads to centre.
  // Outer ring 16 squares (perimeter of 5x5): (0,0)(0,1)(0,2)(0,3)(0,4)(1,4)(2,4)(3,4)(4,4)(4,3)(4,2)(4,1)(4,0)(3,0)(2,0)(1,0)
  const outer=[[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[3,0],[2,0],[1,0]];
  // Then continue with inner path: (1,1)(1,2)(1,3)(2,3)(3,3)(3,2)(3,1)(2,1) — 8
  const inner=[[1,1],[1,2],[1,3],[2,3],[3,3],[3,2],[3,1],[2,1]];
  // total 24 track, add cross arms middle? We'll use 32 by adding extra loop: repeat outer with offset? Instead just use 24 track for compact.
  // Let's use 24 track + 5 home =29 per player, enough.
  const order=[...outer,...inner];
  order.forEach(([r,c])=> pts.push(toXY(r,c)));
  // centre is home entry before final
  pts.push(toXY(2,2)); // centre
  return pts; // 25 pts (24+1)
}
const TRACK=buildTrack(); // 25 track
const HOME_LEN=5;
const SAFE=[0,4,8,12,24]; // safe indices (corners + centre)

export class ChowkaGame{
  constructor(root){
    this.root=root;
    this.track=TRACK;
    this.players=null;
    this.turn=0;
    this.cowries=[0,0,0,0];
    this.lastThrow=0;
    this.movable=[]; // token indices that can move
    this.selected=null;
    this.winner=null;
  }
  init(){
    this.root.innerHTML=`
      <div class="chowka-layout">
        <div class="chowka-card">
          <div class="chowka-banner">🎲 Chowka Bhara <span style="opacity:.8;font-weight:400">· Ashta Chamma — 5×5</span></div>
          <div class="chowka-board-wrap" id="chowkaWrap"><svg id="chowkaSvg" viewBox="0 0 1000 1000"></svg><div id="chowkaLayer"></div></div>
          <div class="chowka-cowries" id="chowkaCowries"></div>
          <div class="chowka-controls">
            <div style="flex:1">
              <div id="chowkaTurn" style="font-family:var(--font-display);font-weight:700;color:#0f2e1a">Your turn</div>
              <div id="chowkaHint" style="font-size:.82rem;color:#2a5a2a">Throw cowries to start</div>
            </div>
            <button id="chowkaThrow" class="gold-btn" style="padding:9px 18px">🐚 Throw</button>
            <button id="chowkaRestart" class="ghost-btn" style="color:#0f2e1a;border-color:#c9a86a;background:#fff">🔄 Restart</button>
          </div>
          <div id="chowkaStatus" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"></div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block"><h3 class="panel-title">📜 Rules</h3>
            <div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>🐚 Throw 4 cowries — <b>1/2/3/4/8</b> (8 if all up). Need <b>1 or 8</b> to enter.</div>
              <div>⭐ Safe stars — can't be captured.</div>
              <div>⚔️ Land on opponent → send back to start.</div>
              <div>🎯 Exact to home (centre ⭐). All 4 home wins.</div>
              <div>🎉 4 or 8 grants extra throw.</div>
            </div>
          </div>
          <div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="chowkaLog" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;font-size:.82rem"></ol></div>
        </aside>
      </div>`;
    this.svg=this.root.querySelector('#chowkaSvg');
    this.layer=this.root.querySelector('#chowkaLayer');
    this.cowriesEl=this.root.querySelector('#chowkaCowries');
    this.turnEl=this.root.querySelector('#chowkaTurn');
    this.hintEl=this.root.querySelector('#chowkaHint');
    this.logEl=this.root.querySelector('#chowkaLog');
    this.statusEl=this.root.querySelector('#chowkaStatus');
    this.throwBtn=this.root.querySelector('#chowkaThrow');
    this.throwBtn.addEventListener('click',()=>this.throw());
    this.root.querySelector('#chowkaRestart').addEventListener('click',()=>this.start());
    this.renderBoard();
    this.renderCowries();
    this.start();
  }
  onShow(){ this.renderTokens(); }
  onHide(){}
  renderBoard(){
    const NS='http://www.w3.org/2000/svg';
    const svg=this.svg; svg.innerHTML='';
    const bg=document.createElementNS(NS,'rect');
    bg.setAttribute('x',0);bg.setAttribute('y',0);bg.setAttribute('width',1000);bg.setAttribute('height',1000);bg.setAttribute('rx',18);bg.setAttribute('fill','#fffdf4');
    svg.appendChild(bg);
    // 5x5 grid squares
    for(let r=0;r<5;r++) for(let c=0;c<5;c++){
      const x=120+c*190-70, y=120+r*190-70;
      const rect=document.createElementNS(NS,'rect');
      rect.setAttribute('x',x);rect.setAttribute('y',y);rect.setAttribute('width',140);rect.setAttribute('height',140);rect.setAttribute('rx',12);
      const isCentre=r===2&&c===2;
      const isCross = r===2 || c===2;
      let fill=isCentre?'#ffefc2': isCross?'#fff7d6':'#f6efdc';
      rect.setAttribute('fill',fill);
      rect.setAttribute('stroke','#8d5a2b');rect.setAttribute('stroke-width',3);
      svg.appendChild(rect);
      if(isCentre){
        const t=document.createElementNS(NS,'text');
        t.setAttribute('x',500);t.setAttribute('y',515);t.setAttribute('text-anchor','middle');t.setAttribute('font-size',22);t.textContent='⭐';
        svg.appendChild(t);
      }
    }
    // track dots
    this.track.forEach((p,i)=>{
      const isSafe=SAFE.includes(i);
      const c=document.createElementNS(NS,'circle');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',isSafe?16:9);
      c.setAttribute('fill',isSafe?'#ffefc2':'#fff');c.setAttribute('stroke',isSafe?'#d4a017':'#c9b48a');c.setAttribute('stroke-width',isSafe?3:2);
      svg.appendChild(c);
      if(isSafe){
        const t=document.createElementNS(NS,'text');
        t.setAttribute('x',p.x);t.setAttribute('y',p.y+4);t.setAttribute('text-anchor','middle');t.setAttribute('font-size',10);t.textContent='★';
        t.setAttribute('fill','#9c6b00');t.setAttribute('font-weight','800');t.setAttribute('pointer-events','none');
        svg.appendChild(t);
      }
    });
    // lines between track
    for(let i=0;i<this.track.length-1;i++){
      const a=this.track[i], b=this.track[i+1];
      if(Math.hypot(a.x-b.x,a.y-b.y)>260) continue; // skip jumps
      const l=document.createElementNS(NS,'line');
      l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);
      l.setAttribute('stroke','#c9b48a');l.setAttribute('stroke-width',3);l.setAttribute('stroke-dasharray','8 8');l.setAttribute('opacity',.9);
      svg.appendChild(l);
    }
    const frame=document.createElementNS(NS,'rect');
    frame.setAttribute('x',8);frame.setAttribute('y',8);frame.setAttribute('width',984);frame.setAttribute('height',984);frame.setAttribute('rx',16);frame.setAttribute('fill','none');frame.setAttribute('stroke','#d4a017');frame.setAttribute('stroke-width',6);frame.setAttribute('opacity',.7);
    svg.appendChild(frame);
  }
  renderCowries(){
    this.cowriesEl.innerHTML='';
    this.cowries.forEach((v,i)=>{
      const s=document.createElement('div');
      s.className='chowka-shell'+(v?' up':'');
      s.title=v?'up':'down';
      this.cowriesEl.appendChild(s);
    });
    const valEl=document.createElement('div');
    valEl.style.cssText='font-family:var(--font-display);font-weight:800;font-size:1.4rem;color:#5a3200;min-width:36px;text-align:center';
    valEl.textContent=this.lastThrow||'—';
    this.cowriesEl.appendChild(valEl);
  }
  start(){
    this.players=[
      {name:'You', color:'#ef233c', avatar:'🦁', tokens:Array(4).fill(-1), home:0}, // -1 = yard, 0..trackLen-1 = on track, 100+ = home stretch
      {name:'Bot', color:'#4361ee', avatar:'🐯', tokens:Array(4).fill(-1), home:0}
    ];
    this.turn=0; this.cowries=[0,0,0,0]; this.lastThrow=0; this.movable=[]; this.selected=null; this.winner=null;
    this.logEl.innerHTML='';
    this.log('🎲 Chowka Bhara — You (🦁) vs Bot (🐯). Throw cowries!',' #ffb703');
    this.updateBanner(); this.renderTokens(); this.renderCowries();
    this.throwBtn.disabled=false;
  }
  log(msg,color=null){
    const li=document.createElement('li');
    li.textContent=msg;
    li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';
    if(color) li.style.borderLeftColor=color;
    this.logEl.prepend(li);
    while(this.logEl.children.length>12) this.logEl.lastChild.remove();
  }
  updateBanner(){
    if(this.winner){ this.turnEl.textContent=`🏆 ${this.winner} wins!`; this.hintEl.textContent='All 4 home — Restart to play again'; this.throwBtn.disabled=true; return; }
    const p=this.players[this.turn];
    this.turnEl.textContent=`${p.avatar} ${p.name}'s turn`;
    if(this.movable.length){
      this.hintEl.textContent='Tap a glowing token to move';
      this.throwBtn.disabled=true;
    } else {
      this.hintEl.textContent= this.turn===0 ? 'Throw cowries 🐚' : 'Bot throwing…';
      this.throwBtn.disabled = this.turn!==0;
    }
    const s=this.players.map(pl=>`<span style="background:${pl.color};color:#fff;border-radius:20px;padding:4px 10px;font-size:.78rem;font-weight:700">${pl.avatar} ${pl.name}: ${pl.home}/4 home</span>`).join('');
    this.statusEl.innerHTML=s+` <span style="background:#fff;border:1px solid #c9a86a;border-radius:20px;padding:4px 10px;font-size:.78rem;color:#5a3200">🐚 Last <b>${this.lastThrow||'—'}</b></span>`;
  }
  renderTokens(){
    this.layer.innerHTML='';
    // group counting per position
    const groups=new Map();
    this.players.forEach((pl,pi)=>{
      pl.tokens.forEach((pos,ti)=>{
        let key, x,y;
        if(pos===-1){
          // yard positions
          const yardX= pi===0 ? 140+ (ti%2)*110 : 750+ (ti%2)*110;
          const yardY= pi===0 ? 860+ Math.floor(ti/2)*90 : 860+ Math.floor(ti/2)*90;
          x=yardX; y=yardY; key=`yard-${pi}-${ti}`;
        } else if(pos>=100){
          // home stretch towards centre
          const homeIdx=pos-100;
          const base=this.track[this.track.length-1];
          const t=homeIdx/HOME_LEN;
          x= base.x + (500-base.x)* (t*0.6);
          y= base.y + (500-base.y)* (t*0.6);
          key=`home-${pi}-${pos}`;
        } else {
          const pt=this.track[pos];
          x=pt.x; y=pt.y; key=`track-${pos}`;
        }
        if(!groups.has(key)) groups.set(key,[]);
        groups.get(key).push({pi,ti,pos,x,y});
      });
    });
    groups.forEach(members=>{
      members.forEach(({pi,ti,pos,x,y},idx)=>{
        const pl=this.players[pi];
        const el=document.createElement('div');
        el.className='chowka-token';
        el.style.left=`${x/10}%`;
        el.style.top=`${y/10}%`;
        el.style.background=`radial-gradient(circle at 30% 30%, #fff, ${pl.color})`;
        el.textContent=pl.avatar;
        const isMovable=this.turn===pi && this.movable.includes(ti);
        if(isMovable) el.classList.add('movable');
        if(pos===-1) el.style.opacity='.92';
        // offset stacking
        if(members.length>1){
          const off=[[-9,-7],[9,-7],[0,9],[9,9]][idx%4];
          el.style.transform=`translate(-50%,-50%) translate(${off[0]}px,${off[1]}px)`;
        }
        el.addEventListener('click',()=>this.onToken(pi,ti));
        this.layer.appendChild(el);
      });
    });
  }
  posForToken(playerIdx, tokenPos){
    // returns track index or home
    return tokenPos;
  }
  computeMovable(throwVal){
    const pl=this.players[this.turn];
    const out=[];
    for(let i=0;i<4;i++){
      const pos=pl.tokens[i];
      if(pos===-1){
        if(throwVal===1 || throwVal===8) out.push(i);
      } else if(pos>=100){
        const homeIdx=pos-100;
        if(homeIdx+throwVal<=HOME_LEN) out.push(i); // exact home needs HOME_LEN
        if(homeIdx+throwVal===HOME_LEN) out.push(i); // will be counted
      } else {
        // on track
        const needToHome = this.track.length-1 - pos;
        // if throw would go beyond track, enter home stretch
        // home stretch starts after last track point
        if(pos + throwVal < this.track.length) out.push(i);
        else if(pos + throwVal === this.track.length) out.push(i); // land on entry
        else {
          const over= pos+throwVal - this.track.length;
          if(over<=HOME_LEN) out.push(i);
        }
      }
    }
    // need exact home: if over>HOME_LEN not allowed, we already filtered
    // but need to ensure no blocking? allow
    this.movable=out;
  }
  throw(){
    if(this.winner) return;
    if(this.movable.length) { this.log('Move a token first',' #ffb703'); return; }
    // cowrie random
    this.cowries=this.cowries.map(()=> Math.random()<0.5?1:0);
    const ups=this.cowries.filter(v=>v===1).length;
    let val;
    if(ups===0) val=8;
    else if(ups===4) val=4;
    else val=ups; // 1,2,3
    // But per COWRIE_MAP? Use above: 0->8,1->1...
    // already
    this.lastThrow=val;
    this.renderCowries();
    this.cowriesEl.animate([{transform:'translateY(-4px)'},{transform:'translateY(0)'}],{duration:220});
    const p=this.players[this.turn];
    this.log(`🐚 ${p.name} threw ${val} (${ups} up)`, p.color);
    this.computeMovable(val);
    if(this.movable.length===0){
      this.log(`No move for ${val} — turn passes`,' #8d5a2b');
      this.nextTurn(val===4||val===8); // extra on 4/8? but no move, still extra?
      return;
    }
    this.updateBanner(); this.renderTokens();
    // if bot, auto move
    if(this.turn===1) setTimeout(()=>this.botMove(), 700);
  }
  onToken(pi,ti){
    if(this.winner) return;
    if(pi!==this.turn) return;
    if(!this.movable.includes(ti)) return;
    this.moveToken(ti);
  }
  moveToken(ti){
    const pl=this.players[this.turn];
    const from=pl.tokens[ti];
    const val=this.lastThrow;
    let to;
    let captured=false;
    if(from===-1){
      to=0; // enter at start (track 0)
    } else if(from>=100){
      const hi=from-100;
      const n=hi+val;
      if(n===HOME_LEN){
        // home!
        pl.tokens[ti]=100+HOME_LEN;
        pl.home++;
        this.log(`🏠 ${pl.name}'s ${pl.avatar} reaches home! (${pl.home}/4)`, pl.color);
        this.movable=[]; this.selected=null;
        if(pl.home===4){ this.winner=pl.name; this.log(`🏆 ${pl.name} wins Chowka Bhara!`,' #ffd166'); this.updateBanner(); this.renderTokens(); return; }
        // extra turn stays? home gives extra?
        this.movable=[];
        this.updateBanner(); this.renderTokens();
        const extra = (val===4||val===8);
        if(extra) { this.log('🎉 Extra throw for 4/8',' #2dc653'); }
        else { this.nextTurn(false); }
        // if next is bot, auto
        if(this.turn===1 && !this.winner) setTimeout(()=>this.throw(), 800);
        return;
      } else if(n<HOME_LEN){
        to=100+n;
      } else {
        this.log('Need exact home!',' #ef233c');
        return;
      }
    } else {
      // on track
      const nxt=from+val;
      if(nxt < this.track.length) to=nxt;
      else if(nxt===this.track.length) to=this.track.length-1; // stay?
      else {
        const over=nxt - this.track.length;
        if(over===HOME_LEN){
          pl.tokens[ti]=100+HOME_LEN; pl.home++; this.log(`🏠 ${pl.name} home! (${pl.home}/4)`, pl.color);
          if(pl.home===4){ this.winner=pl.name; this.updateBanner(); this.renderTokens(); return; }
          this.movable=[]; this.updateBanner(); this.renderTokens();
          this.nextTurn(val===4||val===8);
          if(this.turn===1 && !this.winner) setTimeout(()=>this.throw(),800);
          return;
        } else if(over<HOME_LEN){
          to=100+over;
        } else {
          this.log('Need exact home',' #ef233c');
          return;
        }
      }
    }
    // capture check if landing on track
    if(typeof to==='number' && to<100){
      const oppIdx=1-this.turn;
      const opp=this.players[oppIdx];
      // if target is safe, no capture
      const isSafe=SAFE.includes(to);
      if(!isSafe){
        for(let oi=0;oi<4;oi++){
          if(opp.tokens[oi]===to){
            opp.tokens[oi]=-1;
            captured=true;
            this.log(`⚔️ ${pl.name} captures ${opp.name}'s token!`,' #ef233c');
            break;
          }
        }
      }
      pl.tokens[ti]=to;
    } else {
      pl.tokens[ti]=to;
    }
    this.log(`➜ ${pl.name} ${from===-1?'enters':from} → ${to}`, pl.color);
    // check extra turn
    const extra = (val===4||val===8||captured);
    this.movable=[];
    this.renderTokens();
    if(this.winner){ this.updateBanner(); return; }
    if(extra && !captured){
      this.log('🎉 Extra throw!',' #2dc653');
      this.updateBanner();
      if(this.turn===1) setTimeout(()=>this.throw(), 800);
      return;
    }
    if(captured){
      this.log('🎉 Capture — extra throw!',' #2dc653');
      this.updateBanner();
      if(this.turn===1) setTimeout(()=>this.throw(), 800);
      return;
    }
    this.nextTurn(false);
    if(this.turn===1 && !this.winner) setTimeout(()=>this.throw(), 800);
  }
  nextTurn(keeps){
    if(this.winner) return;
    if(!keeps) this.turn=1-this.turn;
    this.movable=[]; this.lastThrow=0;
    this.updateBanner(); this.renderTokens();
  }
  botMove(){
    if(this.winner || this.turn!==1 || !this.movable.length) return;
    // pick best: prefer home, then capture, then furthest
    let best=this.movable[0], bestScore=-1;
    for(const ti of this.movable){
      const pos=this.players[1].tokens[ti];
      let score=0;
      let to;
      if(pos===-1) to=0;
      else if(pos>=100) to=pos; // home stretch
      else to=pos+this.lastThrow;
      if(to>=100 || to>= this.track.length) score+=50; // home entry
      // capture?
      if(typeof to==='number' && to<100 && !SAFE.includes(to)){
        const opp=this.players[0];
        if(opp.tokens.includes(to)) score+=40;
      }
      // progress
      if(typeof pos==='number' && pos>=0) score+= pos;
      if(score>bestScore){ bestScore=score; best=ti; }
    }
    this.moveToken(best);
  }
}
