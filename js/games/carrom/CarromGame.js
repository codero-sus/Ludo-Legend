/* ═════════════════════════════════════════════════════════════
   games/carrom/CarromGame.js — Indian Carrom (simplified physics)
   2 players, striker flick, 9+9+1, pockets, wooden board
   Physics: velocity, friction, wall bounce, coin collisions, pockets
   Indian styled: teak, ivory, maroon powder
   ═════════════════════════════════════════════════════════════ */
import { rand } from "../../core/utils.js";

const POCKETS = [
  {x:40,y:40,r:26},{x:560,y:40,r:26},{x:40,y:560,r:26},{x:560,y:560,r:26}
];
const BOARD = 600;
const COIN_R = 14;
const STRIKER_R = 18;

export class CarromGame {
  constructor(root){
    this.root=root;
    this.canvas=null; this.ctx=null;
    this.coins=[]; this.striker=null;
    this.turn=0; // 0 or 1
    this.scores=[0,0];
    this.aiming=false; this.power=0;
    this.animFrame=0;
    this.running=false;
  }
  init(){
    this.root.innerHTML=`
      <div class="carrom-layout">
        <div class="carrom-card">
          <div class="carrom-banner">🏹 Carrom • कैरम <span style="opacity:.85;font-weight:400">— Flick the striker!</span></div>
          <div class="carrom-wrap" id="carromWrap">
            <canvas id="carromCanvas" width="600" height="600"></canvas>
            <div class="carrom-aim" id="carromAim"></div>
          </div>
          <div class="carrom-controls">
            <div style="flex:1">
              <div id="carromTurn" style="font-family:var(--font-display);font-weight:700;color:var(--ink)">Player 1's turn</div>
              <div id="carromHint" style="font-size:.82rem;color:var(--ink-soft)">Drag on board to aim, release to flick</div>
              <div class="carrom-power" style="margin-top:8px"><div class="carrom-power-fill" id="carromPower"></div></div>
            </div>
            <button id="carromReset" class="gold-btn" style="padding:9px 16px">🔄 Reset</button>
          </div>
        </div>
        <aside style="display:flex;flex-direction:column;gap:14px">
          <div class="panel-block">
            <h3 class="panel-title">🏆 Score</h3>
            <div id="carromScore" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
          </div>
          <div class="panel-block">
            <h3 class="panel-title">📜 Rules (simplified)</h3>
            <div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)">
              <div>⚪ White — Player 1</div>
              <div>⚫ Black — Player 2</div>
              <div>🔴 Queen = 3 pts (pocket anytime)</div>
              <div>🎯 Drag striker to aim, release to shoot</div>
              <div>🕳️ Pocket all your coins to win</div>
            </div>
          </div>
          <div class="panel-block">
            <h3 class="panel-title">🎯 Controls</h3>
            <div style="font-size:.82rem;color:rgba(255,255,255,.85)">Mouse drag or touch drag from striker. Power = drag distance. <br> <b style="color:var(--gold)">Tip:</b> Hit queen last for bonus!</div>
          </div>
        </aside>
      </div>
    `;
    this.canvas=this.root.querySelector("#carromCanvas");
    this.ctx=this.canvas.getContext("2d");
    this.wrap=this.root.querySelector("#carromWrap");
    this.aim=this.root.querySelector("#carromAim");
    this.turnEl=this.root.querySelector("#carromTurn");
    this.hintEl=this.root.querySelector("#carromHint");
    this.powerEl=this.root.querySelector("#carromPower");
    this.scoreEl=this.root.querySelector("#carromScore");
    this.root.querySelector("#carromReset").addEventListener("click", ()=> this.reset());
    this.setupCoins();
    this.bindDrag();
    this.loop();
    this.updateScore();
  }
  onHide(){ this.running=false; cancelAnimationFrame(this.animFrame); }
  onShow(){ if(!this.running){ this.running=true; this.loop(); } }

  setupCoins(){
    this.coins=[];
    // 9 white, 9 black, 1 queen in center pattern
    const whitePos=[
      [300,300],[270,270],[330,270],[270,330],[330,330],[300,250],[300,350],[250,300],[350,300]
    ];
    // use 9 white, but we have queen at center, so adjust
    // We'll place queen at center, 4 white around, 4 black around, plus outer ring
    this.coins.push({x:300,y:300, vx:0,vy:0, type:"queen", color:"#ef233c", r:12, pocketed:false});
    const positions=[
      [300,270,"white"],[300,330,"white"],[270,300,"black"],[330,300,"black"],
      [270,270,"white"],[330,270,"black"],[270,330,"black"],[330,330,"white"],
      [300,240,"white"],[300,360,"black"],[240,300,"white"],[360,300,"black"],
      [280,250,"black"],[320,250,"white"],[280,350,"white"],[320,350,"black"],
      [250,280,"white"],[350,280,"black"]
    ];
    // pick first 18
    positions.slice(0,18).forEach(([x,y,type])=>{
      this.coins.push({x, y, vx:0,vy:0, type, color: type==="white"?"#fff":"#1a1a1a", r:COIN_R, pocketed:false, border: type==="white"?"#c9b48a":"#5a3a1a"});
    });
    // striker at bottom center (player side)
    this.striker={x:300,y:520,vx:0,vy:0,r:STRIKER_R, color:"#ffb703", type:"striker"};
    this.turn=rand(0,1);
    this.updateTurn();
  }

  bindDrag(){
    let start=null, cur=null;
    const getPos=(e)=>{
      const rect=this.canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return {
        x: (pt.clientX - rect.left) / rect.width * BOARD,
        y: (pt.clientY - rect.top) / rect.height * BOARD
      };
    };
    const hitStriker=(p)=> Math.hypot(p.x - this.striker.x, p.y - this.striker.y) < 30;

    const down=(e)=>{
      const p=getPos(e);
      if(!hitStriker(p)) return;
      if(this.isMoving()) return;
      start=p; this.aiming=true;
      e.preventDefault();
    };
    const move=(e)=>{
      if(!this.aiming || !start) return;
      cur=getPos(e);
      const dx=start.x - cur.x, dy=start.y - cur.y;
      const dist=Math.min(Math.hypot(dx,dy), 140);
      this.power=dist/140;
      this.powerEl.style.width=`${this.power*100}%`;
      // aim line
      const ang=Math.atan2(dy,dx);
      const len=dist*1.2;
      const sx=this.striker.x, sy=this.striker.y;
      this.aim.style.display="block";
      this.aim.style.left=`${sx/BOARD*100}%`;
      this.aim.style.top=`${sy/BOARD*100}%`;
      this.aim.style.width=`${len/BOARD*100}%`;
      this.aim.style.transform=`rotate(${ang}rad)`;
      e.preventDefault();
    };
    const up=(e)=>{
      if(!this.aiming || !start || !cur) { this.aiming=false; this.aim.style.display="none"; this.powerEl.style.width="0%"; return; }
      const dx=start.x - cur.x, dy=start.y - cur.y;
      const dist=Math.hypot(dx,dy);
      if(dist<8){ this.aiming=false; this.aim.style.display="none"; return; }
      const power=Math.min(dist/14, 14);
      const ang=Math.atan2(dy,dx);
      this.striker.vx=Math.cos(ang)*power;
      this.striker.vy=Math.sin(ang)*power;
      // slight random
      this.striker.vx += (Math.random()-0.5)*0.4;
      this.aiming=false; this.aim.style.display="none"; this.powerEl.style.width="0%";
      start=null; cur=null;
    };
    this.canvas.addEventListener("mousedown", down);
    this.canvas.addEventListener("touchstart", down, {passive:false});
    window.addEventListener("mousemove", move, {passive:false});
    window.addEventListener("touchmove", move, {passive:false});
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
  }

  isMoving(){
    if(Math.hypot(this.striker.vx, this.striker.vy) > 0.15) return true;
    return this.coins.some(c=> !c.pocketed && Math.hypot(c.vx,c.vy) > 0.12);
  }

  reset(){ this.setupCoins(); this.scores=[0,0]; this.updateScore(); }

  updateTurn(){
    const names=["Player 1 (White)","Player 2 (Black)"];
    this.turnEl.textContent=`${["⚪","⚫"][this.turn]} ${names[this.turn]}'s turn`;
    this.turnEl.style.color = this.turn===0 ? "#fff" : "#1a1a1a";
    this.turnEl.style.background = this.turn===0 ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";
    this.turnEl.style.display="inline-block"; this.turnEl.style.padding="2px 10px"; this.turnEl.style.borderRadius="8px";
  }
  updateScore(){
    this.scoreEl.innerHTML=`
      <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:10px;text-align:center;border:2px solid ${this.turn===0?"#fff":"transparent"}">
        <div style="font-size:1.4rem">⚪</div><div style="font-weight:800;color:#fff">${this.scores[0]}</div><div style="font-size:.72rem;color:rgba(255,255,255,.7)">White</div>
      </div>
      <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:10px;text-align:center;border:2px solid ${this.turn===1?"#fff":"transparent"}">
        <div style="font-size:1.4rem">⚫</div><div style="font-weight:800;color:#fff">${this.scores[1]}</div><div style="font-size:.72rem;color:rgba(255,255,255,.7)">Black</div>
      </div>
    `;
    // check win
    const whitePocketed = this.coins.filter(c=>c.type==="white" && c.pocketed).length;
    const blackPocketed = this.coins.filter(c=>c.type==="black" && c.pocketed).length;
    if(whitePocketed>=9 || blackPocketed>=9){
      const winner = whitePocketed>=9 ? 0 : 1;
      this.hintEl.textContent=`🏆 ${["White","Black"][winner]} wins!`;
      this.hintEl.style.color="var(--gold)";
      // confetti via board flash
      this.wrap.animate([{filter:"brightness(1)"},{filter:"brightness(1.2)"},{filter:"brightness(1)"}],{duration:500});
    }
  }

  loop(){
    this.running=true;
    const step=()=>{
      this.updatePhysics();
      this.draw();
      // switch turn when stopped after a shot
      if(!this.isMoving() && this._wasMoving){
        this._wasMoving=false;
        // check pockets just pocketed this turn? We count score already in physics
        // switch turn
        this.turn = this.turn===0?1:0;
        this.updateTurn();
        this.updateScore();
        // reset striker to base line
        this.striker.x=300; this.striker.y=520; this.striker.vx=0; this.striker.vy=0;
      }
      if(this.isMoving()) this._wasMoving=true;
      this.animFrame=requestAnimationFrame(step);
    };
    step();
  }

  updatePhysics(){
    const friction=0.985;
    const wallDamp=0.78;
    const objs=[...this.coins.filter(c=>!c.pocketed), this.striker];

    // integrate
    for(const o of objs){
      o.x += o.vx; o.y += o.vy;
      o.vx *= friction; o.vy *= friction;
      if(Math.abs(o.vx)<0.02) o.vx=0;
      if(Math.abs(o.vy)<0.02) o.vy=0;
      // wall bounce
      if(o.x - o.r < 28){ o.x=28+o.r; o.vx*=-wallDamp; }
      if(o.x + o.r > BOARD-28){ o.x=BOARD-28 - o.r; o.vx*=-wallDamp; }
      if(o.y - o.r < 28){ o.y=28+o.r; o.vy*=-wallDamp; }
      if(o.y + o.r > BOARD-28){ o.y=BOARD-28 - o.r; o.vy*=-wallDamp; }
      // pockets
      for(const p of POCKETS){
        const d=Math.hypot(o.x - p.x, o.y - p.y);
        if(d < p.r - 2){
          if(o.type==="striker"){
            // foul: reset striker
            o.x=300; o.y=520; o.vx=0; o.vy=0;
            this.hintEl.textContent="Foul! Striker in pocket";
            setTimeout(()=> this.hintEl.textContent="Drag to aim, release to flick",1200);
          } else if(!o.pocketed){
            o.pocketed=true; o.vx=0; o.vy=0;
            if(o.type==="queen") this.scores[this.turn]+=3;
            else if(o.type==="white" && this.turn===0) this.scores[0]+=1;
            else if(o.type==="black" && this.turn===1) this.scores[1]+=1;
            else this.scores[this.turn]+=1; // simplified: any pocket gives point to shooter
          }
        }
      }
    }
    // coin-coin collisions (simple impulse)
    for(let i=0;i<objs.length;i++){
      for(let j=i+1;j<objs.length;j++){
        const a=objs[i], b=objs[j];
        const dx=b.x - a.x, dy=b.y - a.y;
        const dist=Math.hypot(dx,dy);
        const min= a.r + b.r;
        if(dist < min && dist>0.1){
          // push apart
          const overlap=(min - dist)/2;
          const nx=dx/dist, ny=dy/dist;
          a.x -= nx*overlap; a.y -= ny*overlap;
          b.x += nx*overlap; b.y += ny*overlap;
          // elastic-ish
          const dvx=b.vx - a.vx, dvy=b.vy - a.vy;
          const dot=dvx*nx + dvy*ny;
          if(dot<0){
            const imp = dot * 0.85;
            a.vx += imp*nx; a.vy += imp*ny;
            b.vx -= imp*nx; b.vy -= imp*ny;
          }
        }
      }
    }
  }

  draw(){
    const ctx=this.ctx;
    ctx.clearRect(0,0,BOARD,BOARD);
    // board wood
    ctx.fillStyle="#e8c99a"; ctx.fillRect(0,0,BOARD,BOARD);
    // border
    ctx.strokeStyle="#8d5a2b"; ctx.lineWidth=28; ctx.strokeRect(14,14,BOARD-28,BOARD-28);
    ctx.strokeStyle="#f6efdc"; ctx.lineWidth=4; ctx.strokeRect(28,28,BOARD-56,BOARD-56);
    // center circle
    ctx.strokeStyle="rgba(90,40,20,.35)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(300,300,90,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(300,300,14,0,Math.PI*2); ctx.fillStyle="#8d5a2b"; ctx.fill();
    // pockets
    for(const p of POCKETS){
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle="#1a1a1a"; ctx.fill();
      ctx.strokeStyle="#3a2410"; ctx.lineWidth=4; ctx.stroke();
      // inner gold
      ctx.beginPath(); ctx.arc(p.x,p.y,8,0,Math.PI*2); ctx.fillStyle="#d4a017"; ctx.fill();
    }
    // decorative rangoli corners
    ctx.fillStyle="rgba(212,160,23,.18)";
    [[80,80],[520,80],[80,520],[520,520]].forEach(([x,y])=>{
      ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
    });
    // coins
    for(const c of this.coins){
      if(c.pocketed) continue;
      ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
      ctx.fillStyle=c.color; ctx.fill();
      ctx.strokeStyle=c.border || "rgba(0,0,0,.25)"; ctx.lineWidth=2; ctx.stroke();
      if(c.type==="queen"){
        ctx.fillStyle="#fff"; ctx.font="bold 10px Poppins"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("Q", c.x, c.y+1);
      } else if(c.type==="white" || c.type==="black"){
        ctx.beginPath(); ctx.arc(c.x,c.y,4,0,Math.PI*2);
        ctx.fillStyle=c.type==="white"?"rgba(0,0,0,.12)":"rgba(255,255,255,.18)"; ctx.fill();
      }
    }
    // striker
    ctx.beginPath(); ctx.arc(this.striker.x,this.striker.y,this.striker.r,0,Math.PI*2);
    ctx.fillStyle=this.striker.color; ctx.fill();
    ctx.strokeStyle="#8d5a2b"; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(this.striker.x,this.striker.y,6,0,Math.PI*2); ctx.fillStyle="rgba(90,40,20,.25)"; ctx.fill();
    // base line
    ctx.strokeStyle="rgba(239,35,60,.55)"; ctx.lineWidth=2; ctx.setLineDash([8,8]);
    ctx.beginPath(); ctx.moveTo(120,520); ctx.lineTo(480,520); ctx.stroke();
    ctx.setLineDash([]);
  }
}
