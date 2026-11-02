import { getNeighbors } from "./hexGrid.js";

// BFS: all connected bubbles with the same colour as the start bubble.
export function findConnectedBubbles(board, startR, startC) {
  const start = board[startR]?.[startC];
  if (!start) return [];
  const seen = new Set([`${startR},${startC}`]);
  const queue = [[startR, startC]];
  const group = [];
  while (queue.length) {
    const [r, c] = queue.shift();
    group.push([r, c]);
    for (const [nr, nc] of getNeighbors(r, c, board.length)) {
      const key = `${nr},${nc}`;
      const nb = board[nr][nc];
      if (!seen.has(key) && nb && nb.color === start.color) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return group;
}