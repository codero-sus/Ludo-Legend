/* games/mathquiz/MathquizGame.js — Math Quiz — famous in India */
export class MathquizGame{
 constructor(root){this.root=root}
 init(){
  this.root.innerHTML=`<div class="mathquiz-layout"><div class="mathquiz-card"><div class="mathquiz-banner">🧮 Math Quiz <span style="opacity:.85;font-weight:400">· Famous in India</span></div><div class="mathquiz-board" id="mathquizBoard"></div><div class="mathquiz-controls"><button id="mathquizNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New</button>${`<button id="mathquizNext" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">Next</button>`}<span id="mathquizStatus" style="font-weight:700;color:#5a3200"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 About</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>🧮 <b>Math Quiz</b> — too much famous in India, played in streets, homes & festivals!</div><div>Simple, fun, for all ages — pure desi + global charm.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="mathquizLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#mathquizBoard');this.statusEl=this.root.querySelector('#mathquizStatus');this.logEl=this.root.querySelector('#mathquizLog');this.scoreEl=this.root.querySelector('#mathquizScore')||{textContent:''};
  this.root.querySelector('#mathquizNew').addEventListener('click',()=>this.start());
  
  
  
  
  this.root.querySelector('#mathquizNext')?.addEventListener('click',()=>this.nextQ());
  
  
  
  this.start();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 start(){this.score=0; this.nextQ(); this.renderStart && this.renderStart(); this.log('Started Math Quiz',' #2dc653');}
 
  nextQ(){
    const qs=[
      {q:'National bird of India?', a:['Peacock','Parrot','Crow','Pigeon'], c:0},
      {q:'Capital of India?', a:['Mumbai','Delhi','Kolkata','Chennai'], c:1},
      {q:'Festival of lights?', a:['Holi','Diwali','Eid','Christmas'], c:1},
      {q:'How many states in India? (2024)', a:['28','29','30','27'], c:0},
      {q:'National animal?', a:['Lion','Tiger','Elephant','Bear'], c:1},
      {q:'Ganga flows into?', a:['Arabian Sea','Bay of Bengal','Indian Ocean','Thar'], c:1},
    ];
    this.q=qs[Math.floor(Math.random()*qs.length)];
    this.boardEl.innerHTML='<div style="font-weight:700;color:#7a0a0a;text-align:center">'+this.q.q+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">'+this.q.a.map((opt,i)=>'<button data-i="'+i+'" style="padding:10px;border-radius:8px;border:2px solid #c9b48a;background:#fff;font-weight:700;cursor:pointer">'+opt+'</button>').join('')+'</div>';
    this.boardEl.querySelectorAll('button').forEach(b=> b.addEventListener('click',()=>this.answer(parseInt(b.dataset.i))));
    this.statusEl.textContent='Choose an answer';
  }
  answer(i){
    if(i===this.q.c){this.score++; this.log('✅ Correct',' #2dc653'); this.statusEl.textContent='✅ Correct!';}
    else {this.log('❌ Wrong — '+this.q.a[this.q.c],'#ef233c'); this.statusEl.textContent='❌ Wrong, correct: '+this.q.a[this.q.c];}
    this.scoreEl.textContent='Score '+this.score;
    setTimeout(()=>this.nextQ(),900);
  }
}
