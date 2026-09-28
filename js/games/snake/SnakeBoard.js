/* ═════════════════════════════════════════════════════════════
   games/snake/SnakeBoard.js — Moksha Patam board data & layout
   10x10 boustrophedon, 1 bottom-left to 100 top-left.
   Snakes (Nagas) and Ladders (bamboo) — Indian styled positions
   ═════════════════════════════════════════════════════════════ */
export const SNAKES = {
  16:6, 47:26, 49:11, 56:53, 62:19, 64:60, 87:24, 93:73, 95:75, 98:78
};
export const LADDERS = {
  1:38, 4:14, 9:31, 21:42, 28:84, 36:44, 51:67, 71:91, 80:100
};
// Decorative safe (peacock) cells
export const SAFE_CELLS = new Set([1,14,28,38,44,67,84,91,100]);

// Board coordinates: cell number -> {row, col, x, y} in 0..9
export function cellToCoord(n){
  // n 1..100, row 0 top, col 0 left
  const rowFromBottom = Math.floor((n-1)/10);
  const row = 9 - rowFromBottom;
  const colInRow = (n-1)%10;
  const col = (rowFromBottom %2===0) ? colInRow : 9 - colInRow;
  return { row, col, x: col+0.5, y: row+0.5 };
}
export function coordToCell(row,col){
  const rowFromBottom = 9 - row;
  const base = rowFromBottom*10;
  const colInRow = (rowFromBottom%2===0) ? col : 9 - col;
  return base + colInRow + 1;
}
export function isSnakeHead(n){ return SNAKES[n]!==undefined; }
export function isLadderBase(n){ return LADDERS[n]!==undefined; }
