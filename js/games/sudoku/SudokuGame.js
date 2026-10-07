/* Sudoku 9x9 — puzzle + solve check, Western mini */
function generateSolved(){
  const b=Array(9).fill(0).map(()=>Array(9).fill(0));
  function isValid(r,c,n){for(let i=0;i<9;i++)if(b[r][i]===n||b[i][c]===n)return false;const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++)if(b[br+rr][bc+cc]===n)return false;return true}
  function solve(pos=0){if(pos===81)return true;const r=Math.floor(pos/9),c=pos%9;if(b[r][c])return solve(pos+1);const nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);for(const n of nums){if(isValid(r,c,n)){b[r][c]=n;if(solve(pos+1))return true;b[r][c]=0}}return false}
  solve();return b;
}
export class SudokuGame{
 constructor(root){this.root=root;this.difficulty=40}
 init(){
  this.root.innerHTML=`<div class="sudoku-layout"><div class="sudoku-card"><div class="sudoku-banner">🔢 Sudoku <span style="opacity:.8;font-weight:400">· 9×9 · Fill 1-9</span></div><div class="sudoku-board" id="sudoBoard"></div><div class="sudoku-numpad" id="sudoPad"></div><div style="display:flex;gap:8px;margin-top:10px;justify-content:center"><button id="sudoNew" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">🔄 New Puzzle</button><button id="sudoCheck" class="gold-btn" style="padding:8px 14px">✓ Check</button><button id="sudoSolve" class="ghost-btn" style="background:#fff;border-color:#c9a86a;color:#5a3200">💡 Solve</button><span id="sudoStatus" style="font-weight:700;color:#5a3200;margin-left:6px"></span></div></div><aside style="display:flex;flex-direction:column;gap:14px"><div class="panel-block"><h3 class="panel-title">📜 Rules</h3><div style="font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.9)"><div>Fill 1-9 so each row/col/3×3 has 1-9.</div><div>Click cell then number. Given = beige.</div></div></div><div class="panel-block"><h3 class="panel-title">📜 Log</h3><ol id="sudoLog" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:.82rem"></ol></div></aside></div>`;
  this.boardEl=this.root.querySelector('#sudoBoard');this.padEl=this.root.querySelector('#sudoPad');this.statusEl=this.root.querySelector('#sudoStatus');this.logEl=this.root.querySelector('#sudoLog');
  this.root.querySelector('#sudoNew').addEventListener('click',()=>this.newPuzzle());
  this.root.querySelector('#sudoCheck').addEventListener('click',()=>this.check());
  this.root.querySelector('#sudoSolve').addEventListener('click',()=>this.solveShow());
  this.newPuzzle();
 }
 onShow(){} onHide(){}
 log(m,c){const li=document.createElement('li');li.textContent=m;li.style.cssText='background:rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;border-left:4px solid var(--gold)';if(c)li.style.borderLeftColor=c;this.logEl.prepend(li);while(this.logEl.children.length>10)this.logEl.lastChild.remove()}
 newPuzzle(){
  const solved=generateSolved();
  this.solution=solved.map(r=>[...r]);
  this.puzzle=solved.map(r=>[...r]);
  // remove difficulty cells
  let toRemove=this.difficulty;
  while(toRemove>0){const r=Math.floor(Math.random()*9),c=Math.floor(Math.random()*9);if(this.puzzle[r][c]!==0){this.puzzle[r][c]=0;toRemove--;}}
  this.board=this.puzzle.map(r=>[...r]);
  this.selected=null;this.render();
  this.statusEl.textContent='Puzzle ready';
  this.log('New Sudoku — 40 empty',' #4361ee');
 }
 render(){
  this.boardEl.innerHTML='';
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    const v=this.board[r][c];
    const given=this.puzzle[r][c]!==0;
    const cell=document.createElement('div');cell.className='sudoku-cell'+(given?' given':'')+(this.selected&&this.selected[0]===r&&this.selected[1]===c?' selected':'');
    cell.textContent=v||'';
    cell.addEventListener('click',()=>{if(given)return; this.selected=[r,c];this.render()});
    this.boardEl.appendChild(cell);
  }
  this.padEl.innerHTML='';
  for(let n=1;n<=9;n++){const b=document.createElement('button');b.textContent=n;b.addEventListener('click',()=>this.place(n));this.padEl.appendChild(b);}
  const del=document.createElement('button');del.textContent='✕';del.addEventListener('click',()=>this.place(0));this.padEl.appendChild(del);
  const clr=document.createElement('button');clr.textContent='Clear';clr.addEventListener('click',()=>{if(this.selected){this.board[this.selected[0]][this.selected[1]]=0;this.render()}});this.padEl.appendChild(clr);
 }
 place(n){
  if(!this.selected)return;
  const [r,c]=this.selected;if(this.puzzle[r][c]!==0)return;
  this.board[r][c]=n; this.render();
  // auto check win
  if(this.board.flat().every(v=>v!==0)){this.check()}
 }
 check(){
  // validate
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(this.board[r][c]===0){this.statusEl.textContent='Incomplete';return}}
  for(let r=0;r<9;r++){const seen=new Set();for(let c=0;c<9;c++){const v=this.board[r][c];if(seen.has(v)){this.statusEl.textContent='Row '+ (r+1)+' duplicate';this.log('Row error','#ef233c');return}seen.add(v)}}
  for(let c=0;c<9;c++){const seen=new Set();for(let r=0;r<9;r++){const v=this.board[r][c];if(seen.has(v)){this.statusEl.textContent='Col '+ (c+1)+' duplicate';return}seen.add(v)}}
  for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++){const seen=new Set();for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++){const v=this.board[br*3+rr][bc*3+cc];if(seen.has(v)){this.statusEl.textContent='Box error';return}seen.add(v)}}
  this.statusEl.textContent='✅ Solved! Great!';
  this.log('✅ Sudoku solved!',' #2dc653');
 }
 solveShow(){this.board=this.solution.map(r=>[...r]);this.render();this.statusEl.textContent='Solution shown';}
}
