import {
  BUBBLE_RADIUS as R,
  BOARD_WIDTH,
  ROW_HEIGHT,
  BUBBLE_DIAMETER as D,
} from "./constants.js";
import { cellToPixel, colsInRow, getNeighbors } from "./hexGrid.js";

const HIT_DISTANCE = D * 0.9;

// Nearest EMPTY cell (touching the ceiling or another bubble) to a point.
export function findSnapCell(board, x, y) {
  const baseRow = Math.round((y - R) / ROW_HEIGHT);
  let best = null;
  let bestDist = Infinity;
  for (
    let r = Math.max(0, baseRow - 1);
    r <= Math.min(board.length - 1, baseRow + 1);
    r++
  ) {
    for (let c = 0; c < colsInRow(r); c++) {
      if (board[r][c]) continue;
      const attached =
        r === 0 ||
        getNeighbors(r, c, board.length).some(([nr, nc]) => board[nr][nc]);
      if (!attached) continue;
      const p = cellToPixel(r, c);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = { r, c };
      }
    }
  }
  return best;
}

function hitsBubble(board, x, y) {
  const baseRow = Math.round((y - R) / ROW_HEIGHT);
  for (
    let r = Math.max(0, baseRow - 2);
    r <= Math.min(board.length - 1, baseRow + 2);
    r++
  ) {
    for (let c = 0; c < colsInRow(r); c++) {
      if (!board[r][c]) continue;
      const p = cellToPixel(r, c);
      if (Math.hypot(p.x - x, p.y - y) < HIT_DISTANCE) return true;
    }
  }
  return false;
}

/**
 * Simulates a shot. angle: radians, 0 = right, PI/2 = straight up.
 * Returns { path, stop, cell } - path is the list of points (bounces included)
 * used for the trajectory preview AND the real shot, so both always agree.
 */
export function traceShot(board, startX, startY, angle, maxBounces = 6) {
  const step = R / 4;
  let x = startX,
    y = startY;
  let dx = Math.cos(angle),
    dy = -Math.sin(angle);
  const path = [{ x, y }];
  let bounces = 0;

  if (dy >= 0) return { path, stop: { x, y }, cell: null };

  for (let i = 0; i < 4000; i++) {
    x += dx * step;
    y += dy * step;

    if (x <= R) {
      x = R;
      dx = Math.abs(dx);
      path.push({ x, y });
      if (++bounces > maxBounces) break;
    } else if (x >= BOARD_WIDTH - R) {
      x = BOARD_WIDTH - R;
      dx = -Math.abs(dx);
      path.push({ x, y });
      if (++bounces > maxBounces) break;
    }

    if (y <= R || hitsBubble(board, x, y)) break;
  }

  path.push({ x, y });
  return { path, stop: { x, y }, cell: findSnapCell(board, x, y) };
}