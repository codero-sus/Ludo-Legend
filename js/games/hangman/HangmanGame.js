/* Hangman — Guess the word, 6 lives, Western chalk */
const WORDS=["BHARAT","INDIA","FESTIVAL","DIWALI","HOLI","CRICKET","CHESS","CARROM","LUDO","PUZZLE","GUESS","WORD","MATCH","RECTANGLE","GLOBAL","FAMOUS","TETRIS","SUDOKU","POKER","JAPAN","ENGLAND","AMERICA","WORLD","LETTER","BRAIN","MUSIC","DANCE","SMILE","MAGIC","TIGER","ELEPHANT","PEACOCK","RANGOLI","SWEET","FAMILY","FRIEND","SCHOOL","COLLEGE","MARKET","CINEMA","MOVIE","HANGMAN","LETTERS","ALPHABET"];
export class HangmanGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="hangman-layout"><div class="hangman-card"><div class="hangman-banner">🔤 Hangman — Guess the Word <span style="opacity:.8;font-weight:400">· No country, just letters</span></div><div class="hangman-gallows" id="hmDraw"></div><div class="hangman-word" id="hmWord"></div><div style="text-align:center;font-weight:700;color:#b22222" id="hmLives"></div><div class="hangman-keys" id="hmKeys"></div><div style="display:flex;gap:8px;justify-content:center;margin-top:10px"><button id="hmNew" class="gold-btn" style="padding:8px 14px">🔄 New Word</button><button id="hmHint" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">💡 Hint</button><span id="hmStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Guess letters. 6 wrong = hanged.</div><div>Guess the word — famous global word game.</div><div>No country — just brain!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Stats</h3><div id="hmStats" style="color:var(--gold);font-weight:700"></div></div></aside></div>`;
  this.drawEl=this.root.querySelector('#hmDraw');this.wordEl=this.root.querySelector('#hmWord');this.livesEl=this.root.querySelector('#hmLives');this.keysEl=this.root.querySelector('#hmKeys');this.statusEl=this.root.querySelector('#hmStatus');this.statsEl=this.root.querySelector('#hmStats');
  this.root.querySelector('#hmNew').addEventListener('click',()=>this.newWord());
  this.root.querySelector('#hmHint').addEventListener('click',()=>this.hint());
  this.wins=0;this.losses=0;this.newWord();
 }
 onShow(){} onHide(){}
 newWord(){
  this.word=WORDS[Math.floor(Math.random()*WORDS.length)];
  this.guessed=new Set();this.wrong=0;this.over=false;
  this.render();
 }
 render(){
  this.wordEl.innerHTML='';for(const ch of this.word){const d=document.createElement('div');d.className='hangman-letter';d.textContent=this.guessed.has(ch)||this.over?ch:'';this.wordEl.appendChild(d);}
  this.livesEl.textContent=`❤️ ${6-this.wrong} lives`;
  // draw gallows simple ascii
  const stages=[""," O"," O\n |"," O\n/|"," O\n/|\\"," O\n/|\\\n/"," O\n/|\\\n/ \\"];
  this.drawEl.innerHTML=`<pre style="font-size:1.8rem;line-height:1.2;text-align:center">${stages[this.wrong]||''}\n${this.wrong>=1?'— — —':''}</pre><div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:.75rem;color:#6d4a2a">${this.word.length} letters</div>`;
  this.keysEl.innerHTML='';for(let c=65;c<=90;c++){const ch=String.fromCharCode(c);const b=document.createElement('button');b.textContent=ch;b.disabled=this.guessed.has(ch)||this.over;
    if(this.guessed.has(ch)){b.classList.add(this.word.includes(ch)?'correct':'wrong')}
    b.addEventListener('click',()=>this.guess(ch));this.keysEl.appendChild(b);}
  if(this.word.split('').every(ch=>this.guessed.has(ch))){this.over=true;this.statusEl.textContent='✅ You guessed it!';this.wins++;this.statsEl.textContent=`W ${this.wins} — L ${this.losses}`;}
  else if(this.wrong>=6){this.over=true;this.statusEl.textContent=`💀 Word was ${this.word}`;this.losses++;this.statsEl.textContent=`W ${this.wins} — L ${this.losses}`;}
  else {this.statusEl.textContent='Guess a letter';}
  if(!this.over) this.statsEl.textContent=`W ${this.wins} — L ${this.losses}`;
 }
 guess(ch){
  if(this.over||this.guessed.has(ch))return;
  this.guessed.add(ch);if(!this.word.includes(ch))this.wrong++;this.render();
 }
 hint(){
  if(this.over)return;
  const unguessed=[...this.word].filter(ch=>!this.guessed.has(ch));
  if(unguessed.length){this.guess(unguessed[0])}
 }
}
