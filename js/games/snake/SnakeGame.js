/* ═════════════════════════════════════════════════════════════
   games/snake/SnakeGame.js — Moksha Patam (Snake & Ladder)
   2-4 players, exact 100, Indian styled Nagas & bamboo ladders
   Modular, uses shared Dice/Audio/Toasts when available, else fallback
   ═════════════════════════════════════════════════════════════ */
import { SNAKES, LADDERS, cellToCoord } from "./SnakeBoard.js";
import { rand, wait } from "../../core/utils.js";

const COLORS = ["#ef233c","#2dc653","#4361ee","#ffb703"];
const AVATARS = ["🦁","🦚","🐘","🐯"];
const NAMES = ["You","Aarav","Priya","Kabir"];

export class SnakeGame {
  constructor(root){
    this.root = root;
    this.players = [];
    this.turn = 0;
    this.phase = "idle"; // rolling | moving
    this.winner = null;
    this.animating = false;
  }

  init(){
    this.root.innerHTML = `
      <div class="snake-layout">
        <div class="snake-card">
          <div class="snake-banner">🐍 Moksha Patam <span style="opacity:.9;font-weight:400">· Snake &amp; Ladder — Indian Edition 🪜</span></div>
          <div class="snake-board-wrap" id="snakeWrap">
            <svg id="snakeSvg" viewBox="0 0 1000 1000" aria-label="Moksha Patam board"></svg>
            <div id="snakeTokenLayer"></div>
          </div>
          <div class="snake-dicebar">
            <div class="snake-dice" id="snakeDice">—</div>
            <div class="snake-controls">
              <div id="snakeTurn" style="font-family:var(--font-display);font-weight:700;color:var(--ink)">Welcome!</div>
              <div id="snakeHint" style="font-size:.84rem;color:var(--ink-soft)">Choose players and start</div>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="snakeRoll" class="gold-btn" style="padding:9px 18px">🎲 Roll</button>
                <button id="snakeRestart" class="ghost-btn" style="color:var(--ink);border-color:#c9bfa5;background:rgba(0,0,0,.05)">🔄 Restart</button>
              </div>
            </div>
          </div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block">
            <h3 class="panel-title">👥 Players</h3>
            <div id="snakePlayers"></div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button data-c="2" class="chip-btn snake-count">2P</button>
              <button data-c="3" class="chip-btn snake-count">3P</button>
              <button data-c="4" class="chip-btn snake-count active">4P</button>
            </div>
          </div>
          <div class="panel-block">
            <h3 class="panel-title">🪜 Legends</h3>
            <div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>🐍 <b style="color:#ff8fa3">Naga</b> — slide down (16→6, 47→26, 93→73…)</div>
              <div>🪜 <b style="color:#ffe08a">Bamboo ladder</b> — climb up (1→38, 28→84…)</div>
              <div>⭐ Safe peacock cells — celebrate</div>
              <div>🎯 Need exact 100 to win</div>
            </div>
          </div>
          <div class="panel-block">
            <h3 class="panel-title">📜 Log</h3>
            <ol id="snakeLog" style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto;font-size:.82rem"></ol>
          </div>
        </aside>
      </div>
    `;
    this.svg = this.root.querySelector("#snakeSvg");
    this.layer = this.root.querySelector("#snakeTokenLayer");
    this.diceEl = this.root.querySelector("#snakeDice");
    this.turnEl = this.root.querySelector("#snakeTurn");
    this.hintEl = this.root.querySelector("#snakeHint");
    this.logEl = this.root.querySelector("#snakeLog");
    this.playersEl = this.root.querySelector("#snakePlayers");
    this.rollBtn = this.root.querySelector("#snakeRoll");
    this.restartBtn = this.root.querySelector("#snakeRestart");

    this.rollBtn.addEventListener("click", ()=> this.roll());
    this.restartBtn.addEventListener("click", ()=> this.start());
    this.root.querySelectorAll(".snake-count").forEach(b=>{
      b.addEventListener("click", ()=>{
        this.root.querySelectorAll(".snake-count").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        this.playerCount = Number(b.dataset.c);
        this.start();
      });
    });
    this.playerCount = 4;
    this.renderBoard();
    this.start();
    // keyboard Space
    this._key = (e)=>{ if(e.code==="Space" && this.root.classList.contains("active") && !this.animating) { e.preventDefault(); this.roll(); } };
    window.addEventListener("keydown", this._key);
  }

  onHide(){ /* pause */ }
  onShow(){ this.renderTokens(); }

  renderBoard(){
    const NS="http://www.w3.org/2000/svg";
    const svg=this.svg; svg.innerHTML="";
    // bg
    const bg=document.createElementNS(NS,"rect");
    bg.setAttribute("x",0);bg.setAttribute("y",0);bg.setAttribute("width",1000);bg.setAttribute("height",1000);bg.setAttribute("rx",18);bg.setAttribute("fill","#fffdf4");
    svg.appendChild(bg);
    // cells
    for(let n=1;n<=100;n++){
      const {row,col}=cellToCoord(n);
      const x=col*100, y=row*100;
      const rect=document.createElementNS(NS,"rect");
      rect.setAttribute("x",x+2);rect.setAttribute("y",y+2);rect.setAttribute("width",96);rect.setAttribute("height",96);rect.setAttribute("rx",10);
      const isDark = (row+col)%2===0;
      let fill = isDark ? "#efe3c8" : "#fffdf4";
      if(SNAKES[n]) fill="#ffd9de";
      else if(LADDERS[n]) fill="#d3f2dc";
      else if(n===100) fill="#ffefc2";
      rect.setAttribute("fill", fill);
      rect.setAttribute("stroke","#c9b48a"); rect.setAttribute("stroke-width",2);
      svg.appendChild(rect);
      const txt=document.createElementNS(NS,"text");
      txt.setAttribute("x", x+12); txt.setAttribute("y", y+18);
      txt.setAttribute("font-size",16); txt.setAttribute("fill","#5b5175"); txt.setAttribute("font-weight","700");
      txt.textContent=n;
      svg.appendChild(txt);
      // icons
      if(SNAKES[n]){
        const t=document.createElementNS(NS,"text");
        t.setAttribute("x", x+50); t.setAttribute("y", y+64);
        t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
        t.setAttribute("font-size",28); t.textContent="🐍";
        svg.appendChild(t);
      } else if(LADDERS[n]){
        const t=document.createElementNS(NS,"text");
        t.setAttribute("x", x+50); t.setAttribute("y", y+64);
        t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
        t.setAttribute("font-size",24); t.textContent="🪜";
        svg.appendChild(t);
      }
      if(n===100){
        const t=document.createElementNS(NS,"text");
        t.setAttribute("x", x+50); t.setAttribute("y", y+74);
        t.setAttribute("text-anchor","middle"); t.setAttribute("font-size",12); t.setAttribute("fill","#9c6b00"); t.setAttribute("font-weight","800");
        t.textContent="MOKSHA";
        svg.appendChild(t);
      }
    }
    // draw ladders as bamboo
    const ladderPairs = Object.entries(LADDERS);
    for(const [from,to] of ladderPairs){
      const a=cellToCoord(Number(from)), b=cellToCoord(Number(to));
      const x1=a.col*100+50, y1=a.row*100+50, x2=b.col*100+50, y2=b.row*100+50;
      // two rails
      const angle=Math.atan2(y2-y1, x2-x1);
      const off=8;
      const dx=Math.sin(angle)*off, dy=-Math.cos(angle)*off;
      ["#b58863","#8d5a2b"].forEach((col,i)=>{
        const l=document.createElementNS(NS,"line");
        l.setAttribute("x1",x1 + (i?dx:-dx)); l.setAttribute("y1",y1 + (i?dy:-dy));
        l.setAttribute("x2",x2 + (i?dx:-dx)); l.setAttribute("y2",y2 + (i?dy:-dy));
        l.setAttribute("stroke",col); l.setAttribute("stroke-width",7); l.setAttribute("stroke-linecap","round");
        l.setAttribute("opacity",.95);
        svg.appendChild(l);
      });
      // rungs
      const steps=4;
      for(let i=1;i<steps;i++){
        const t=i/steps;
        const x=x1 + (x2-x1)*t, y=y1 + (y2-y1)*t;
        const l=document.createElementNS(NS,"line");
        l.setAttribute("x1", x - dx*1.2); l.setAttribute("y1", y - dy*1.2);
        l.setAttribute("x2", x + dx*1.2); l.setAttribute("y2", y + dy*1.2);
        l.setAttribute("stroke","#5a3a1a"); l.setAttribute("stroke-width",4); l.setAttribute("stroke-linecap","round");
        svg.appendChild(l);
      }
    }
    // snakes as curved paths
    const snakePairs = Object.entries(SNAKES);
    for(const [from,to] of snakePairs){
      const a=cellToCoord(Number(from)), b=cellToCoord(Number(to));
      const x1=a.col*100+50, y1=a.row*100+50, x2=b.col*100+50, y2=b.row*100+50;
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      const cx = mx + (Math.random()-0.5)*60;
      const cy = my;
      const path=document.createElementNS(NS,"path");
      const d=`M ${x1} ${y1} Q ${cx} ${cy-80} ${x2} ${y2}`;
      path.setAttribute("d", d);
      path.setAttribute("fill","none"); path.setAttribute("stroke","#ef233c"); path.setAttribute("stroke-width",8);
      path.setAttribute("stroke-linecap","round"); path.setAttribute("opacity",.92);
      path.setAttribute("stroke-dasharray","14 10");
      svg.appendChild(path);
      // head
      const head=document.createElementNS(NS,"text");
      head.setAttribute("x", x1); head.setAttribute("y", y1-10);
      head.setAttribute("text-anchor","middle"); head.setAttribute("font-size",22);
      head.textContent="🐍";
      svg.appendChild(head);
    }
    // border
    const frame=document.createElementNS(NS,"rect");
    frame.setAttribute("x",6);frame.setAttribute("y",6);frame.setAttribute("width",988);frame.setAttribute("height",988);frame.setAttribute("rx",16);
    frame.setAttribute("fill","none");frame.setAttribute("stroke","#d4a017");frame.setAttribute("stroke-width",8);frame.setAttribute("opacity",.9);
    svg.appendChild(frame);
  }

  start(){
    const count=this.playerCount||4;
    this.players = Array.from({length:count}, (_,i)=>({
      name: NAMES[i] || `Player ${i+1}`,
      color: COLORS[i],
      avatar: AVATARS[i],
      pos: 1,
      wins:0
    }));
    this.turn=0; this.winner=null; this.animating=false;
    this.playersEl.innerHTML="";
    this.players.forEach((p,i)=>{
      const div=document.createElement("div");
      div.className="player-card";
      div.style.cssText="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.07);border:2px solid transparent;border-radius:12px;padding:8px 10px;margin-bottom:8px";
      div.id=`snake-card-${i}`;
      div.innerHTML=`<div style="width:38px;height:38px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;border:2px solid #fff">${p.avatar}</div><div style="flex:1"><div style="font-weight:700;color:#fff">${p.name}</div><div style="font-size:.78rem;color:rgba(255,255,255,.7)">Cell ${p.pos}</div></div><div style="font-weight:800;color:var(--gold)">${p.pos}/100</div>`;
      this.playersEl.appendChild(div);
    });
    this.logEl.innerHTML="";
    this.diceEl.textContent="—";
    this.renderTokens();
    this.updateBanner();
  }

  updateBanner(){
    if(this.winner){
      this.turnEl.textContent=`🏆 ${this.winner.name} wins!`;
      this.hintEl.textContent=`Moksha attained! Click Restart`;
      return;
    }
    const p=this.players[this.turn];
    this.turnEl.textContent=`${p.avatar} ${p.name}'s turn — Cell ${p.pos}`;
    this.hintEl.textContent=`Roll the dice! Need exact 100`;
    // highlight active card
    this.players.forEach((_,i)=>{
      const card=document.getElementById(`snake-card-${i}`);
      if(card){
        card.style.borderColor = i===this.turn ? COLORS[i] : "transparent";
        card.style.boxShadow = i===this.turn ? `0 0 12px ${COLORS[i]}66` : "none";
        card.style.transform = i===this.turn ? "scale(1.02)" : "none";
      }
    });
  }

  renderTokens(){
    this.layer.innerHTML="";
    // group by cell for stacking
    const groups = new Map();
    this.players.forEach((p,i)=>{
      const k=p.pos;
      if(!groups.has(k)) groups.set(k,[]);
      groups.get(k).push({p,i});
    });
    groups.forEach((members)=>{
      const needStack = members.length>1;
      members.forEach(({p,i},idx)=>{
        const {row,col}=cellToCoord(p.pos);
        const x=(col*100+50)/1000*100, y=(row*100+50)/1000*100;
        const el=document.createElement("div");
        el.className="snake-token";
        el.style.left=`${x}%`; el.style.top=`${y}%`;
        el.style.background=`radial-gradient(circle at 30% 30%, #fff, ${p.color})`;
        el.style.borderColor="#fff";
        el.textContent=p.avatar;
        if(needStack){
          const off=[[-10, -8],[10,-8],[0,10],[10,10]][idx%4];
          el.style.transform=`translate(-50%,-50%) translate(${off[0]}px, ${off[1]}px)`;
        } else el.style.transform=`translate(-50%,-50%)`;
        if(idx===0 && !needStack) el.style.zIndex=5;
        this.layer.appendChild(el);
      });
    });
  }

  log(msg, color=null){
    const li=document.createElement("li");
    li.textContent=msg;
    li.style.cssText="background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)";
    if(color) li.style.borderLeftColor=color;
    this.logEl.prepend(li);
    while(this.logEl.children.length>12) this.logEl.lastChild.remove();
  }

  async roll(){
    if(this.winner || this.animating) return;
    this.animating=true; this.rollBtn.disabled=true;
    this.diceEl.textContent="…";
    this.diceEl.style.transform="scale(.9) rotate(-8deg)";
    await wait(420);
    const roll=rand(1,6);
    this.diceEl.textContent=roll;
    this.diceEl.style.transform="scale(1.08) rotate(6deg)";
    setTimeout(()=> this.diceEl.style.transform="none",180);
    if(roll===6) this.diceEl.style.boxShadow="0 0 14px var(--gold)";
    else this.diceEl.style.boxShadow="none";
    const p=this.players[this.turn];
    this.log(`🎲 ${p.name} rolled ${roll}`, p.color);
    // animate step
    const from=p.pos;
    let target=from+roll;
    if(target>100){
      this.log(`Need exact 100! Stay at ${from}`, "#ffb703");
      this.hintEl.textContent=`Need ${100-from} exactly`;
      this.animating=false; this.rollBtn.disabled=false;
      this.turn=(this.turn+1)%this.players.length; this.updateBanner();
      return;
    }
    // step animation
    for(let c=from+1;c<=target;c++){
      p.pos=c; this.renderTokens(); this.updateBanner();
      await wait(180);
    }
    // check snake/ladder
    if(SNAKES[target]){
      const dest=SNAKES[target];
      this.log(`🐍 Naga! ${p.name} slides ${target} → ${dest}`, "#ef233c");
      await wait(400);
      p.pos=dest; this.renderTokens(); this.updateBanner();
      this.diceEl.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(0)"}],{duration:320});
    } else if(LADDERS[target]){
      const dest=LADDERS[target];
      this.log(`🪜 Bamboo ladder! ${p.name} climbs ${target} → ${dest}`, "#2dc653");
      await wait(400);
      p.pos=dest; this.renderTokens(); this.updateBanner();
      this.diceEl.animate([{transform:"scale(1)"},{transform:"scale(1.15)"},{transform:"scale(1)"}],{duration:380});
    } else {
      this.log(`➜ ${p.name} to ${target}`, p.color);
    }

    if(p.pos===100){
      this.winner=p;
      this.log(`🏆 ${p.name} attains Moksha!`, p.color);
      this.diceEl.textContent="🏆";
      // confetti
      this.root.querySelector(".snake-board-wrap").animate([{filter:"brightness(1)"},{filter:"brightness(1.18)"},{filter:"brightness(1)"}],{duration:600});
      this.updateBanner();
      this.animating=false; this.rollBtn.disabled=false;
      return;
    }
    // extra turn on 6? classic snake includes extra? We'll grant extra on 6
    if(roll===6){
      this.log(`🎉 Six! ${p.name} gets another turn`, p.color);
      this.hintEl.textContent=`Six! Roll again`;
      this.animating=false; this.rollBtn.disabled=false;
      this.updateBanner();
      return;
    }
    this.turn=(this.turn+1)%this.players.length;
    this.updateBanner();
    this.animating=false; this.rollBtn.disabled=false;
  }
}
