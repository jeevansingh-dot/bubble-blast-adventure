import { traceShot } from "./collision.js";
import { resolveShot } from "./shotResolver.js";
import { cloneBoard } from "./hexGrid.js";

// Tries every angle (1 degree apart), simulates the shot on a COPY of the board,
// and returns the one that destroys the most bubbles. Never changes the real board.
export function findBestShot(board, startX, startY, color, minAngle, maxAngle) {
  const step = Math.PI / 180;
  let best = null;

  for (let angle = minAngle; angle <= maxAngle; angle += step) {
    const { path, cell } = traceShot(board, startX, startY, angle);
    if (!cell) continue;

    const result = resolveShot(cloneBoard(board), cell.r, cell.c, color);
    const value = result.popped.length + result.floating.length * 2;

    if (value > 0 && (!best || value > best.value)) {
      best = {
        angle,
        path,
        cell,
        value,
        popped: result.popped.length,
        floating: result.floating.length,
      };
    }
  }
  return best; // null = no shot makes a match right now
}