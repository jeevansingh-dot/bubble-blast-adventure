
import {
  BUBBLE_RADIUS as R,
  BOARD_WIDTH,
  ROW_HEIGHT,
  BUBBLE_DIAMETER as D,
} from "./constants.js";

import {
  cellToPixel,
  colsInRow,
  getNeighbors,
} from "./hexGrid.js";

const HIT_DISTANCE = D * 0.9;

// =====================================
// FIND NEAREST EMPTY SNAP CELL
// =====================================

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
        getNeighbors(r, c, board.length).some(
          ([nr, nc]) => board[nr][nc]
        );

      if (!attached) continue;

      const position = cellToPixel(r, c);

      const distance = Math.hypot(
        position.x - x,
        position.y - y
      );

      if (distance < bestDist) {
        bestDist = distance;
        best = { r, c };
      }
    }
  }

  return best;
}

// =====================================
// BUBBLE COLLISION
// =====================================

function hitsBubble(board, x, y) {
  const baseRow = Math.round((y - R) / ROW_HEIGHT);

  for (
    let r = Math.max(0, baseRow - 2);
    r <= Math.min(board.length - 1, baseRow + 2);
    r++
  ) {
    for (let c = 0; c < colsInRow(r); c++) {
      if (!board[r][c]) continue;

      const position = cellToPixel(r, c);

      const distance = Math.hypot(
        position.x - x,
        position.y - y
      );

      if (distance < HIT_DISTANCE) {
        return true;
      }
    }
  }

  return false;
}

// =====================================
// SHOT SIMULATION WITH WALL BOUNCE
// =====================================

/**
 * Simulates a bubble shot.
 *
 * angle:
 * 0       = right
 * PI / 2  = straight up
 * PI      = left
 *
 * Returns:
 * {
 *   path,
 *   stop,
 *   cell
 * }
 *
 * Path contains:
 * starting point,
 * wall bounce points,
 * final collision point.
 */

export function traceShot(
  board,
  startX,
  startY,
  angle,
  maxBounces = 6
) {
  const step = R / 4;

  let x = startX;
  let y = startY;

  let dx = Math.cos(angle);
  let dy = -Math.sin(angle);

  let bounces = 0;

  // Only important points are stored.
  const path = [{ x, y }];

  if (dy >= 0) {
    return {
      path,
      stop: { x, y },
      cell: null,
    };
  }

  // =====================================
  // SIMULATION LOOP
  // =====================================

  for (let i = 0; i < 4000; i++) {
    const previousX = x;

    x += dx * step;
    y += dy * step;

    // =====================================
    // LEFT WALL REFLECTION
    // =====================================

    if (x <= R) {
      const overshoot = R - x;

      x = R + overshoot;

      dx = Math.abs(dx);

      bounces++;

      path.push({
        x: R,
        y,
      });

      if (bounces > maxBounces) {
        x = R;
        break;
      }
    }

    // =====================================
    // RIGHT WALL REFLECTION
    // =====================================

    else if (x >= BOARD_WIDTH - R) {
      const overshoot = x - (BOARD_WIDTH - R);

      x = BOARD_WIDTH - R - overshoot;

      dx = -Math.abs(dx);

      bounces++;

      path.push({
        x: BOARD_WIDTH - R,
        y,
      });

      if (bounces > maxBounces) {
        x = BOARD_WIDTH - R;
        break;
      }
    }

    // =====================================
    // CEILING COLLISION
    // =====================================

    if (y <= R) {
      y = R;
      break;
    }

    // =====================================
    // BUBBLE COLLISION
    // =====================================

    if (hitsBubble(board, x, y)) {
      break;
    }

    // Safety against invalid movement.
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      x = previousX;
      break;
    }
  }

  // =====================================
  // FINAL POINT
  // =====================================

  const lastPoint = path[path.length - 1];

  if (
    !lastPoint ||
    Math.hypot(lastPoint.x - x, lastPoint.y - y) > 0.1
  ) {
    path.push({ x, y });
  }

  // =====================================
  // SNAP CELL
  // =====================================

  const cell = findSnapCell(board, x, y);

  return {
    path,
    stop: { x, y },
    cell,
  };
}
