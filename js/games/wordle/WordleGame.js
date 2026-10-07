/* Wordle 5x6 — Find the word from web (global), guess 6 tries */
const WORDLIST=["BHARAT","INDIAN","FESTIV","WORLD","HELLO","MUSIC","DANCE","LIGHT","SMILE","HOUSE","WATER","EARTH","HEART","OCEAN","MAGIC","POWER","BRAIN","SMART","QUICK","TIGER","ELEPH","PEACO","RANGO","SWEET","FAMILY","FRIEND","PUZZLE","GLOBAL","FAMOUS","CARRON","LUDOG","CHESS","SUDOKU","POKERS","JUNGLE","BEACH","NIGHT","DREAM","HAPPY","GAMES","WORDS","MATCH","LETTE","GUESS","SEVEN","THREE","RECTA","INDIA","DIWALI","HOLIDY","CRICK","TETRI","MANGO","SUGAR","SPICE","MASAL","RAJMA","CURRY"];
// normalize to 5 letters: take first 5
const WORDS5=WORDLIST.map(w=>w.slice(0,5).padEnd(5,'A').slice(0,5));
export class WordleGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="wordle-layout"><div class="wordle-card"><div class="wordle-banner">🔤 Wordle — Find the Word <span style="opacity:.8;font-weight:400">· 5 letters · 6 tries</span></div><div class="wordle-board" id="wdBoard"></div><div style="display:flex;gap:6px;margin-top:8px;justify-content:center"><input id="wdInput" maxlength="5" placeholder="TYPE 5 LETTERS" style="text-transform:uppercase;text-align:center;font-weight:800;letter-spacing:.15em;padding:10px;border-radius:8px;border:2px solid #c9b48a;flex:1;max-width:200px"><button id="wdEnter" class="gold-btn">Enter</button><button id="wdNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button></div><div class="wordle-keys" id="wdKeys"></div><div id="wdStatus" style="text-align:center;font-weight:700;color:#5a3200;margin-top:8px"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Guess 5-letter word in 6 tries. </div><div>🟩 Correct place, 🟨 Wrong place, ⬜ Absent.</div><div>Famous global web game — no country!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Info</h3><div style="font-size:.82rem;color:rgba(255,255,255,.9)">Type & Enter. Keyboard also works.</div><div id="wdInfo" style="margin-top:8px;font-size:.8rem;color:var(--gold)"></div></div></aside></div>`;
  this.boardEl=this.root.querySelector('#wdBoard');this.inputEl=this.root.querySelector('#wdInput');this.keysEl=this.root.querySelector('#wdKeys');this.statusEl=this.root.querySelector('#wdStatus');this.infoEl=this.root.querySelector('#wdInfo');
  this.root.querySelector('#wdEnter').addEventListener('click',()=>this.enter());
  this.root.querySelector('#wdNew').addEventListener('click',()=>this.newGame());
  this.inputEl.addEventListener('keydown',e=>{if(e.key==='Enter')this.enter()});
  this.newGame();
 }
 onShow(){} onHide(){}
 newGame(){
  this.answer=WORDS5[Math.floor(Math.random()*WORDS5.length)];
  this.guesses=[];this.over=false;this.statusEl.textContent='Guess the 5-letter word';
  this.infoEl.textContent=`Word to find — 5 letters (e.g., WORLD, HEART). Answer hidden.`;
  this.render();
 }
 render(){
  this.boardEl.innerHTML='';
  for(let r=0;r<6;r++){
    const row=document.createElement('div');row.className='wordle-row';
    for(let c=0;c<5;c++){
      const cell=document.createElement('div');cell.className='wordle-cell';
      const guess=this.guesses[r];
      if(guess){
        const ch=guess.word[c];
        cell.textContent=ch;
        cell.classList.add(guess.colors[c]);
      }
      row.appendChild(cell);
    }
    this.boardEl.appendChild(row);
  }
  // keys
  this.keysEl.innerHTML='';
  'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach(ch=>{
    const b=document.createElement('button');b.textContent=ch;
    // color based on guesses
    let best='';for(const g of this.guesses){for(let i=0;i<5;i++)if(g.word[i]===ch){
      if(g.colors[i]==='correct')best='correct';
      else if(g.colors[i]==='present'&&best!=='correct')best='present';
      else if(!best)best='absent';
    }}
    if(best) b.style.background= best==='correct'?'#6aaa64': best==='present'?'#c9b458':'#787c7e';
    if(best) b.style.color='#fff';
    b.addEventListener('click',()=>{if(this.over)return; this.inputEl.value+=ch; this.inputEl.value=this.inputEl.value.slice(0,5).toUpperCase()});
    this.keysEl.appendChild(b);
  });
 }
 enter(){
  if(this.over)return;
  let w=this.inputEl.value.trim().toUpperCase();
  if(w.length!==5){this.statusEl.textContent='Need 5 letters';return}
  if(!/^[A-Z]{5}$/.test(w)){this.statusEl.textContent='Only A-Z';return}
  // compute colors
  const ans=this.answer.split('');const guess=w.split('');
  const colors=Array(5).fill('absent');
  const count={};ans.forEach(ch=>count[ch]=(count[ch]||0)+1);
  // correct first
  for(let i=0;i<5;i++)if(guess[i]===ans[i]){colors[i]='correct';count[guess[i]]--}
  for(let i=0;i<5;i++)if(colors[i]!=='correct'&&count[guess[i]]>0){colors[i]='present';count[guess[i]]--}
  this.guesses.push({word:w,colors});
  this.inputEl.value='';
  if(w===this.answer){this.over=true;this.statusEl.textContent=`🎉 Correct! ${this.answer}`;this.infoEl.textContent='You found the word! New for next.';}
  else if(this.guesses.length===6){this.over=true;this.statusEl.textContent=`💀 Answer was ${this.answer}`;}
  else {this.statusEl.textContent=`${6-this.guesses.length} tries left`;}
  this.render();
 }
}
