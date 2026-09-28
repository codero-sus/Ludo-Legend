/* ═════════════════════════════════════════════════════════════
   hub/GameHub.js — switches between Bharat Games (modular)
   Ludo | Snake & Ladder (Moksha Patam) | Carrom | Chess (Chaturanga)
   Keeps each game lazy-loaded, preserves Ludo module as-is.
   ═════════════════════════════════════════════════════════════ */
export class GameHub {
  constructor({ hubOverlay, hubNav, gameSections, triggerBtn }) {
    this.hubOverlay = hubOverlay;
    this.hubNav = hubNav;
    this.sections = gameSections; // {ludo, snake, carrom, chess}
    this.triggerBtn = triggerBtn;
    this.current = "ludo";
    this._inited = new Set();
    this._modules = {};

    // nav tabs
    this.hubNav?.querySelectorAll("[data-game]").forEach(btn=>{
      btn.addEventListener("click", ()=> this.showGame(btn.dataset.game, true));
    });
    // hub cards
    this.hubOverlay?.querySelectorAll("[data-jump]").forEach(c=>{
      c.addEventListener("click", ()=> {
        this.hubOverlay.classList.remove("show");
        this.showGame(c.dataset.jump, true);
      });
    });
    this.triggerBtn?.addEventListener("click", ()=> this.toggleHub());

    // close hub on backdrop
    this.hubOverlay?.addEventListener("click", (e)=>{
      if(e.target===this.hubOverlay) this.hubOverlay.classList.remove("show");
    });

    // default
    this.showGame("ludo", false);
  }

  toggleHub(){ this.hubOverlay.classList.toggle("show"); }
  openHub(){ this.hubOverlay.classList.add("show"); }
  closeHub(){ this.hubOverlay.classList.remove("show"); }

  async showGame(name, withToast=false){
    if(!this.sections[name]) return;
    this.current = name;
    // hide all, show target
    Object.entries(this.sections).forEach(([k,el])=>{
      el.classList.toggle("active", k===name);
      el.classList.toggle("game-section", true);
    });
    // nav active
    this.hubNav?.querySelectorAll("[data-game]").forEach(b=> b.classList.toggle("active", b.dataset.game===name));
    // hub cards active
    this.hubOverlay?.querySelectorAll("[data-jump]").forEach(c=> c.classList.toggle("active", c.dataset.jump===name));

    // lazy init
    if(!this._inited.has(name)){
      this._inited.add(name);
      try{
        if(name==="snake"){
          const m = await import("../games/snake/SnakeGame.js");
          this._modules.snake = new m.SnakeGame(document.getElementById("snakeGame"));
          this._modules.snake.init();
        } else if(name==="carrom"){
          const m = await import("../games/carrom/CarromGame.js");
          this._modules.carrom = new m.CarromGame(document.getElementById("carromGame"));
          this._modules.carrom.init();
        } else if(name==="chess"){
          const m = await import("../games/chess/ChessGame.js");
          this._modules.chess = new m.ChessGame(document.getElementById("chessGame"));
          this._modules.chess.init();
        }
      }catch(e){ console.error("Game load failed", name, e); }
    } else {
      // resume if needed
      this._modules[name]?.onShow?.();
    }
    // pause others
    Object.entries(this._modules).forEach(([k,mod])=>{
      if(k!==name) mod?.onHide?.();
    });

    if(withToast){
      const names={ludo:"Ludo Legend", snake:"Moksha Patam", carrom:"Carrom • कैरम", chess:"Bharat Chess"};
      // toast if available
      const box=document.getElementById("toastBox");
      if(box){
        const t=document.createElement("div"); t.className="toast gold"; t.textContent=`🎮 ${names[name] || name}`;
        box.appendChild(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),300); },1800);
      }
    }
    window.scrollTo({top:0, behavior:"smooth"});
  }
}
