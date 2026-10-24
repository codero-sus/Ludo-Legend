/* Yahtzee — 5 dice, 13 categories, upper bonus, Vs Bot */
const CATS=["Ones","Twos","Threes","Fours","Fives","Sixes","Three of a Kind","Four of a Kind","Full House","Small Straight","Large Straight","Yahtzee","Chance"];
function scoreCat(dice,cat){
  const counts={};dice.forEach(v=>counts[v]=(counts[v]||0)+1);const vals=Object.values(counts).sort((a,b)=>b-a);
  const sum=dice.reduce((a,b)=>a+b,0);
  const uniq=[...new Set(dice)].sort((a,b)=>a-b);
  const isSmall= uniq.join(',').includes('1,2,3,4')||uniq.join(',').includes('2,3,4,5')||uniq.join(',').includes('3,4,5,6');
  const isLarge= uniq.length===5 && (uniq[4]-uniq[0]===4);
  switch(cat){
    case "Ones": return dice.filter(v=>v===1).reduce((a,b)=>a+b,0);
    case "Twos": return dice.filter(v=>v===2).reduce((a,b)=>a+b,0);
    case "Threes": return dice.filter(v=>v===3).reduce((a,b)=>a+b,0);
    case "Fours": return dice.filter(v=>v===4).reduce((a,b)=>a+b,0);
    case "Fives": return dice.filter(v=>v===5).reduce((a,b)=>a+b,0);
    case "Sixes": return dice.filter(v=>v===6).reduce((a,b)=>a+b,0);
    case "Three of a Kind": return vals[0]>=3?sum:0;
    case "Four of a Kind": return vals[0]>=4?sum:0;
    case "Full House": return (vals[0]===3&&vals[1]===2)?25:0;
    case "Small Straight": return isSmall?30:0;
    case "Large Straight": return isLarge?40:0;
    case "Yahtzee": return vals[0]===5?50:0;
    case "Chance": return sum;
  }
}
export class YahtzeeGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="yahtzee-layout"><div class="yahtzee-card"><div class="yahtzee-banner">🎲 Yahtzee <span style="opacity:.8;font-weight:400">· 5 dice · 13 categories</span></div><div class="yahtzee-dice" id="yDice"></div><div style="display:flex;gap:8px;justify-content:center"><button id="yRoll" class="gold-btn">🎲 Roll (3)</button><span id="yRolls" style="font-weight:700;color:#5a3200"></span><span id="yTurn" style="font-weight:700;color:#1a2e9a"></span></div><div class="yahtzee-score" id="yScore"></div><div id="yStatus" style="text-align:center;font-weight:700;color:#5a3200;margin-top:8px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Roll 5 dice, hold to keep, 3 rolls per turn.</div><div>Choose category to score. Bonus 35 if upper ≥63.</div><div>Famous global dice poker — very popular!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Total</h3><div id="yTotal" style="font-size:1.4rem;font-weight:800;color:var(--gold)"></div></div></aside></div>`;

  // BOT OPTION — Play with Bot (auto-injected for every game)
  this.vsBot = true;
  this._botTimer = null;
  const _createBotToggle = () => {
    if(this.root.querySelector('#yahtzeeBotToggle')) return;
    const btn=document.createElement('button');
    btn.id='yahtzeeBotToggle';
    btn.textContent='🤖 Play with Bot: ON';
    btn.className='chip-btn active';
    btn.style.margin='6px';
    btn.style.border='1px solid #c9a86a';
    btn.addEventListener('click',()=>{
      this.vsBot=!this.vsBot;
      btn.textContent=this.vsBot?'🤖 Play with Bot: ON':'👤 Play Solo';
      btn.classList.toggle('active',this.vsBot);
      try{this.log(this.vsBot?'🤖 Bot enabled — bot will auto-play!':'👤 Solo mode','#4361ee')}catch{}
      if(this.vsBot) this._triggerBot();
    });
    const container=this.root.querySelector('.yahtzee-controls')||this.root.querySelector('.yahtzee-card')||this.root.querySelector('.panel-block')||this.root;
    container.appendChild(btn);
  };
  setTimeout(_createBotToggle, 80);
  this._triggerBot = () => {
    if(!this.vsBot) return;
    clearTimeout(this._botTimer);
    this._botTimer = setTimeout(()=>{
      try{
        if(typeof this.botMove==='function'){ this.botMove(); }
        else if(typeof this.botPlay==='function'){ this.botPlay(); }
        else {
          // Generic bot: find a clickable element and click it
          const candidates = Array.from(this.root.querySelectorAll('button, [data-idx], .sudoku-cell, .memory-tile, .wordmatch-cell, .tictactoe-cell, .dotsboxes-cell, .crossword-cell, .cricket-btn, .football-btn'));
          const avail = candidates.filter(el=> !el.disabled && !el.classList.contains('matched') && el.offsetParent!==null);
          // Filter to not include the bot toggle itself
          const filtered = avail.filter(el=> el.id!== 'yahtzeeBotToggle' && !el.textContent.includes('Play with Bot'));
          if(filtered.length){
            const pick = filtered[Math.floor(Math.random()*filtered.length)];
            pick.click();
            try{this.log('🤖 Bot played','#4361ee')}catch{}
          }
        }
      }catch(e){ console.log('bot error',e)}
    }, 800);
  };
  // Hook to auto-trigger bot after player actions: wrap log or call _triggerBot after moves
  const _origLog = this.log?.bind(this);

  this.diceEl=this.root.querySelector('#yDice');this.scoreEl=this.root.querySelector('#yScore');this.rollsEl=this.root.querySelector('#yRolls');this.turnEl=this.root.querySelector('#yTurn');this.statusEl=this.root.querySelector('#yStatus');this.totalEl=this.root.querySelector('#yTotal');
  this.root.querySelector('#yRoll').addEventListener('click',()=>this.roll());
  this.start();
 }
 onShow(){} onHide(){}
 start(){
  this.dice=[1,1,1,1,1].map(()=>Math.floor(Math.random()*6)+1);this.held=[false,false,false,false,false];this.rolls=0;this.scores={};this.turn='you';this.gameOver=false;this.render();
 }
 render(){
  this.diceEl.innerHTML='';this.dice.forEach((v,i)=>{
    const d=document.createElement('div');d.className='yahtzee-die'+(this.held[i]?' held':'');d.textContent=v;
    d.addEventListener('click',()=>{if(this.turn!=='you'||this.gameOver)return; this.held[i]=!this.held[i];this.render()});
    this.diceEl.appendChild(d);
  });
  this.rollsEl.textContent=`Rolls ${this.rolls}/3`;
  this.turnEl.textContent=this.gameOver?'Game over': (this.turn==='you'?'🧑 Your turn':'🤖 Bot turn');
  // score sheet
  this.scoreEl.innerHTML='';
  CATS.forEach(cat=>{
    const row=document.createElement('div');row.style.display='contents';
    const label=document.createElement('div');label.textContent=cat;label.style.fontWeight='700';label.style.color='#5a3200';
    const btn=document.createElement('button');const has=this.scores[cat]!==undefined;
    if(has){btn.textContent=this.scores[cat];btn.disabled=true;btn.style.background='#e8e8e8'}
    else {
      const preview= this.rolls? scoreCat(this.dice,cat): '-';
      btn.textContent=preview;
      btn.disabled= this.turn!=='you' || this.rolls===0;
      btn.addEventListener('click',()=>this.choose(cat));
    }
    this.scoreEl.appendChild(label);this.scoreEl.appendChild(btn);
  });
  const total=this.total();
  this.totalEl.textContent=`${total} pts`;
  if(this.gameOver)this.statusEl.textContent=`🏁 Final ${total} — New to play again (Refresh)`;
  else this.statusEl.textContent= this.turn==='you'?'Hold dice then Roll, or choose category':'Bot thinking…';
 }
 total(){
  let sum=0,upper=0;["Ones","Twos","Threes","Fours","Fives","Sixes"].forEach(c=>{if(this.scores[c]!==undefined)upper+=this.scores[c]});
  Object.values(this.scores).forEach(v=>sum+=v);
  if(upper>=63)sum+=35;
  return sum;
 }
 roll(){
  if(this.gameOver||this.turn!=='you'||this.rolls>=3)return;
  for(let i=0;i<5;i++)if(!this.held[i])this.dice[i]=Math.floor(Math.random()*6)+1;
  this.rolls++;this.render();
 }
 choose(cat){
  if(this.scores[cat]!==undefined||this.turn!=='you')return;
  this.scores[cat]=scoreCat(this.dice,cat);
  this.held=[false,false,false,false,false];this.rolls=0;
  if(Object.keys(this.scores).length===13){this.gameOver=true;this.render();return}
  // bot turn simple: roll 1 time and pick best
  this.turn='bot';this.render();
  setTimeout(()=>this.botTurn(),700);
 }
 botTurn(){
  // bot rolls once
  this.dice=[1,1,1,1,1].map(()=>Math.floor(Math.random()*6)+1);
  // pick best remaining category
  let best=null,bestScore=-1;
  CATS.forEach(cat=>{if(this.scores[cat]===undefined){const s=scoreCat(this.dice,cat);if(s>bestScore){bestScore=s;best=cat}}});
  if(best){this.scores[best]=bestScore;}
  if(Object.keys(this.scores).length===13){this.gameOver=true}
  else {this.held=[false,false,false,false,false];this.rolls=0;this.turn='you';}
  this.render();
 }
}
