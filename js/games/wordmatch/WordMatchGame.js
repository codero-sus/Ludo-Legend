/* Word Match 7x5 — Boggle-like, select adjacent letters to form words, 90s timer */
const WORDS=new Set(["CAT","DOG","SUN","MOON","STAR","WORD","GAME","PLAY","TIME","LOVE","BOOK","TREE","FISH","BIRD","BLUE","RED","GREEN","HOUSE","LIGHT","WATER","EARTH","MUSIC","HAPPY","SMILE","DREAM","WORLD","BEACH","OCEAN","MAGIC","POWER","HEART","NIGHT","DAY","MAN","WOMAN","CHILD","FRIEND","FAMILY","INDIA","BHARAT","HELLO","WELCOME","PUZZLE","MATCH","LETTER","SEARCH","BOGGLE","RECTANGLE","SEVEN","FIVE","GRID","RANDOM","LETTERS","WORDS","BRAIN","MIND","THINK","SMART","QUICK","FAST","SLOW","EASY","HARD","TEST","QUIZ","KNOW","LEARN","STUDY","READ","WRITE","SPELL"]);
export class WordMatchGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="wordmatch-layout"><div class="wordmatch-card"><div class="wordmatch-banner">🔤 Word Match 7×5 <span style="opacity:.8;font-weight:400">· Swipe adjacent letters</span></div><div class="wordmatch-board" id="wmBoard"></div><div class="wordmatch-current" id="wmCurrent">Select letters…</div><div style="display:flex;gap:8px;margin-top:8px;justify-content:center"><button id="wmSubmit" class="gold-btn" style="padding:8px 14px">✓ Submit</button><button id="wmClear" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">✕ Clear</button><button id="wmNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New Grid</button><span id="wmScore" style="font-weight:800;color:#5a3200;margin-left:8px"></span><span id="wmTimer" style="font-weight:800;color:#b22222"></span></div><div class="wordmatch-words" id="wmWords"></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 How to Play</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>7×5 rectangle (35 letters). Always rectangle!</div><div>Tap letters in order — each next must touch previous (8 dirs, no reuse).</div><div>Submit if 3+ letters & in dictionary. Score = length².</div><div>⏱ 90s per grid — find as many as you can!</div></div></div><div class="panel-block"><h3 class="panel-title">🏆 Found</h3><div id="wmFound" style="font-size:.85rem;color:rgba(255,255,255,.9)"></div></div></aside></div>`;
  this.boardEl=this.root.querySelector('#wmBoard');this.currentEl=this.root.querySelector('#wmCurrent');this.wordsEl=this.root.querySelector('#wmWords');this.scoreEl=this.root.querySelector('#wmScore');this.timerEl=this.root.querySelector('#wmTimer');this.foundEl=this.root.querySelector('#wmFound');
  this.root.querySelector('#wmSubmit').addEventListener('click',()=>this.submit());
  this.root.querySelector('#wmClear').addEventListener('click',()=>this.clear());
  this.root.querySelector('#wmNew').addEventListener('click',()=>this.newGrid());
  this.newGrid();
 }
 onShow(){} onHide(){clearInterval(this.tid)}
 newGrid(){
  clearInterval(this.tid);
  const letters="ABCDEFGHIKLMNOPRSTUWY";
  this.grid=Array(5).fill(0).map(()=>Array(7).fill(0).map(()=>letters[Math.floor(Math.random()*letters.length)]));
  const vowels="AEIOU";let cnt=0;for(let r=0;r<5;r++)for(let c=0;c<7;c++)if(vowels.includes(this.grid[r][c]))cnt++; while(cnt<10){const r=Math.floor(Math.random()*5),c=Math.floor(Math.random()*7);this.grid[r][c]=vowels[Math.floor(Math.random()*5)];cnt++}
  this.selected=[];this.found=new Set();this.score=0;this.time=90;
  this.render();this.update();
  this.tid=setInterval(()=>{this.time--;this.timerEl.textContent=`⏱ ${this.time}s`;if(this.time<=0){clearInterval(this.tid);this.currentEl.textContent='⏰ Time up! New Grid for next round';}},1000);
 }
 render(){
  this.boardEl.innerHTML='';
  for(let r=0;r<5;r++)for(let c=0;c<7;c++){
    const d=document.createElement('div');d.className='wordmatch-cell';
    if(this.selected.some(p=>p[0]===r&&p[1]===c))d.classList.add('selected');
    d.textContent=this.grid[r][c];
    d.addEventListener('click',()=>this.pick(r,c));
    this.boardEl.appendChild(d);
  }
 }
 pick(r,c){
  const idx=this.selected.findIndex(p=>p[0]===r&&p[1]===c);
  if(idx!==-1){if(idx===this.selected.length-1){this.selected.pop(); this.update(); this.render();}return;}
  if(this.selected.length){const [lr,lc]=this.selected[this.selected.length-1];if(Math.abs(lr-r)>1||Math.abs(lc-c)>1)return;}
  this.selected.push([r,c]);this.update();this.render();
 }
 update(){
  const word=this.selected.map(([r,c])=>this.grid[r][c]).join('');
  this.currentEl.textContent= word||'Select letters…';
  this.currentEl.style.color= word.length>=3 && WORDS.has(word) ? '#0a4d2a' : '#5a3200';
  this.scoreEl.textContent=`Score ${this.score}`;
  this.timerEl.textContent=`⏱ ${this.time}s`;
  this.wordsEl.innerHTML=[...this.found].map(w=>`<span class="wordmatch-word">${w}</span>`).join('')||'<span style="font-size:.78rem;color:#6d4a2a">No words yet</span>';
  this.foundEl.innerHTML= this.found.size? [...this.found].join(', ') : '—';
 }
 clear(){this.selected=[];this.update();this.render()}
 submit(){
  const word=this.selected.map(([r,c])=>this.grid[r][c]).join('');
  if(word.length<3){this.currentEl.textContent='Too short (min 3)';setTimeout(()=>this.update(),900);return}
  if(this.found.has(word)){this.currentEl.textContent='Already found!';this.clear();return}
  if(WORDS.has(word)){this.found.add(word);this.score+=word.length*word.length;this.currentEl.textContent=`✓ ${word} +${word.length*word.length}`;this.clear();this.update();}
  else {this.currentEl.textContent=`✕ ${word} not in dictionary`;setTimeout(()=>{this.clear()},800)}
 }
}
