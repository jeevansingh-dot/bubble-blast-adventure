import {
  BUBBLE_RADIUS as R,
  BUBBLE_DIAMETER as D,
  COLS,
  MAX_ROWS,
  ROW_HEIGHT,
  LETTER_TO_COLOR,
} from "./constants.js";

// Offset ("odd-r") hex grid: odd rows are shifted right by one radius.
export const colsInRow = (r) => (r % 2 === 0 ? COLS : COLS - 1);

export const inBounds = (r, c, maxRows = MAX_ROWS) =>
  r >= 0 && r < maxRows && c >= 0 && c < colsInRow(r);

export function getNeighbors(r, c, maxRows = MAX_ROWS) {
  const deltas =
    r % 2 === 1
      ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
      : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
  return deltas
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([rr, cc]) => inBounds(rr, cc, maxRows));
}

export function cellToPixel(r, c) {
  return { x: R + c * D + (r % 2 === 1 ? R : 0), y: R + r * ROW_HEIGHT };
}

export function createBoard(maxRows = MAX_ROWS) {
  return Array.from({ length: maxRows }, (_, r) =>
    Array(colsInRow(r)).fill(null)
  );
}

// layout example: ["rrbbggyypp.", "rbgypo...."]  ('.' = empty, 'e' = baby chick egg)
export function boardFromLayout(layout, maxRows = MAX_ROWS) {
  const board = createBoard(maxRows);
  layout.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const color = LETTER_TO_COLOR[ch];
      if (inBounds(r, c, maxRows) && color) {
        board[r][c] = { color, type: color === "egg" ? "creature" : "normal" };
      }
    });
  });
  return board;
}

export function forEachBubble(board, fn) {
  board.forEach((row, r) => row.forEach((b, c) => b && fn(b, r, c)));
}

export const cloneBoard = (board) =>
  board.map((row) => row.map((b) => (b ? { ...b } : null)));