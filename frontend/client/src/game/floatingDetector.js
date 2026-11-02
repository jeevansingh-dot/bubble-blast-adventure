import { getNeighbors } from "./hexGrid.js";

// Every bubble not connected (through other bubbles) to the ceiling (row 0).
export function findFloatingBubbles(board) {
  const seen = new Set();
  const queue = [];
  board[0].forEach((b, c) => {
    if (b) {
      seen.add(`0,${c}`);
      queue.push([0, c]);
    }
  });
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [nr, nc] of getNeighbors(r, c, board.length)) {
      const key = `${nr},${nc}`;
      if (!seen.has(key) && board[nr][nc]) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  const floating = [];
  board.forEach((row, r) =>
    row.forEach((b, c) => {
      if (b && !seen.has(`${r},${c}`)) floating.push([r, c]);
    })
  );
  return floating;
}