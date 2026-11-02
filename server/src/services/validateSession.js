import {
  boardFromLayout,
  getNeighbors,
  forEachBubble,
  traceShot,
  resolveShot,
  calculateScore,
  calculateBombScore,
  calculateStars,
  pickColor,
  makeRng,
  BOARD_WIDTH,
} from "../engine/index.js";

// These must match frontend/client/src/components/GameCanvas.jsx
const LAUNCHER_X = BOARD_WIDTH / 2;
const LAUNCHER_Y = 540; // canvas height 600 - 60
const MIN_ANGLE = (15 * Math.PI) / 180;
const MAX_ANGLE = Math.PI - MIN_ANGLE;
const DEFAULT_BOOSTERS = { bomb: 2, rainbow: 2 };
const EPS = 1e-6;

// Thrown when a submitted game cannot be real
export class CheatError extends Error {
  constructor(message) {
    super(message);
    this.name = "CheatError";
  }
}

function countBubbles(board) {
  let n = 0;
  forEachBubble(board, () => n++);
  return n;
}

// The browser tells us where the bubble landed. We simulate the shot ourselves and
// accept the browser's cell only if it is the same cell or a direct neighbour
// (tiny rounding differences between browsers must not punish honest players).
function chooseCell(board, simCell, r, c) {
  if (r === simCell.r && c === simCell.c) return simCell;

  const isNeighbour = getNeighbors(simCell.r, simCell.c, board.length).some(
    ([nr, nc]) => nr === r && nc === c
  );
  const isEmpty = Number.isInteger(r) && Number.isInteger(c) && board[r]?.[c] === null;
  const isAttached =
    isEmpty &&
    (r === 0 || getNeighbors(r, c, board.length).some(([nr, nc]) => board[nr][nc]));

  if (isNeighbour && isEmpty && isAttached) return { r, c };
  throw new CheatError("Landing spot does not match the aim");
}

/**
 * Plays the whole level again on the server.
 * level: level config, seed: the session's random seed,
 * shots: [{ angle, color, r, c }] in the order they were fired.
 */
export function replayGame(level, seed, shots) {
  if (!Array.isArray(shots)) throw new CheatError("Shots are missing");
  if (shots.length === 0) throw new CheatError("No shots were fired");
  if (shots.length > level.shots) throw new CheatError("More shots than the level allows");

  const limits = { ...DEFAULT_BOOSTERS, ...(level.boosters || {}) };
  const used = { bomb: 0, rainbow: 0 };

  const board = boardFromLayout(level.layout);
  const rng = makeRng(seed);
  let current = pickColor(board, rng);
  let next = pickColor(board, rng);

  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let removed = 0;
  let completed = false;

  for (const s of shots) {
    if (completed) throw new CheatError("Shots fired after the level was cleared");

    if (
      !s ||
      typeof s !== "object" ||
      typeof s.angle !== "number" ||
      !Number.isFinite(s.angle) ||
      typeof s.color !== "string" ||
      !Number.isInteger(s.r) ||
      !Number.isInteger(s.c)
    ) {
      throw new CheatError("Malformed shot");
    }
    if (s.angle < MIN_ANGLE - EPS || s.angle > MAX_ANGLE + EPS) {
      throw new CheatError("Aim angle is not possible");
    }

    // which bubble was fired?
    let color;
    if (s.color === "bomb" || s.color === "rainbow") {
      used[s.color] += 1;
      if (used[s.color] > limits[s.color]) throw new CheatError("Booster used too many times");
      color = s.color; // boosters do not use up the queue
    } else {
      if (s.color !== current) throw new CheatError("Bubble colour does not match the queue");
      color = current;
      current = next;
      next = pickColor(board, rng); // same moment the browser picks it
    }

    const sim = traceShot(board, LAUNCHER_X, LAUNCHER_Y, s.angle);
    if (!sim.cell) throw new CheatError("Shot cannot be placed");
    const cell = chooseCell(board, sim.cell, s.r, s.c);

    const result = resolveShot(board, cell.r, cell.c, color);

    if (result.matched) {
      combo += 1;
      bestCombo = Math.max(bestCombo, combo);
    } else {
      combo = 0;
    }
    const mult = Math.max(combo, 1);
    score +=
      result.special === "bomb"
        ? calculateBombScore(result.popped.length, result.floating.length, mult)
        : calculateScore(result.popped.length, result.floating.length, mult);
    removed += result.popped.length + result.floating.length;

    if (countBubbles(board) === 0) completed = true;
  }

  return {
    completed,
    score,
    stars: completed ? Math.max(1, calculateStars(score, level.starThresholds)) : 0,
    bubblesPopped: removed,
    bestCombo,
    shotsUsed: shots.length,
    boostersUsed: used,
  };
}