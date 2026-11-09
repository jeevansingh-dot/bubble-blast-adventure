
import {
  boardFromLayout,
  getNeighbors,
  traceShot,
  resolveShot,
  calculateShotScore,
  countRescued,
  calculateStars,
  isObjectiveComplete,
  countBubbles,
  pickColor,
  makeRng,
  BOARD_WIDTH,
} from "../engine/index.js";

// These must match frontend GameCanvas.jsx
const LAUNCHER_X = BOARD_WIDTH / 2;
const LAUNCHER_Y = 540;

const MIN_ANGLE = (15 * Math.PI) / 180;
const MAX_ANGLE = Math.PI - MIN_ANGLE;

const DEFAULT_BOOSTERS = {
  bomb: 2,
  rainbow: 2,
};

const EPS = 1e-6;

export class CheatError extends Error {
  constructor(message) {
    super(message);
    this.name = "CheatError";
  }
}

function chooseCell(board, simCell, r, c) {
  if (
    r === simCell.r &&
    c === simCell.c
  ) {
    return simCell;
  }

  const isNeighbour = getNeighbors(
    simCell.r,
    simCell.c,
    board.length
  ).some(
    ([nr, nc]) => nr === r && nc === c
  );

  const isEmpty =
    Number.isInteger(r) &&
    Number.isInteger(c) &&
    board[r]?.[c] === null;

  const isAttached =
    isEmpty &&
    (
      r === 0 ||
      getNeighbors(r, c, board.length).some(
        ([nr, nc]) => board[nr][nc]
      )
    );

  if (
    isNeighbour &&
    isEmpty &&
    isAttached
  ) {
    return { r, c };
  }

  throw new CheatError(
    "Landing spot does not match the aim"
  );
}

/**
 * Replays the complete game on the server.
 *
 * Each shot:
 * {
 *   angle,
 *   color,
 *   r,
 *   c,
 *   swapped: true | false
 * }
 */
export function replayGame(level, seed, shots) {
  if (!Array.isArray(shots)) {
    throw new CheatError("Shots are missing");
  }

  if (shots.length === 0) {
    throw new CheatError("No shots were fired");
  }

  if (shots.length > level.shots) {
    throw new CheatError(
      "More shots than the level allows"
    );
  }

  const objective =
    level.objective || {
      type: "clear_all",
    };

  const limits = {
    ...DEFAULT_BOOSTERS,
    ...(level.boosters || {}),
  };

  const used = {
    bomb: 0,
    rainbow: 0,
  };

  const board = boardFromLayout(level.layout);
  const rng = makeRng(seed);

  let current = pickColor(board, rng);
  let next = pickColor(board, rng);

  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let removed = 0;
  let floatingDropped = 0;
  let rescued = 0;

  let completed = false;
  let ended = false;

  for (const s of shots) {
    if (ended) {
      throw new CheatError(
        "Shots fired after the level ended"
      );
    }

    // Validate shot data
    if (
      !s ||
      typeof s !== "object" ||
      typeof s.angle !== "number" ||
      !Number.isFinite(s.angle) ||
      typeof s.color !== "string" ||
      (
        s.swapped !== undefined &&
        typeof s.swapped !== "boolean"
      ) ||
      !Number.isInteger(s.r) ||
      !Number.isInteger(s.c)
    ) {
      throw new CheatError("Malformed shot");
    }

    if (
      s.angle < MIN_ANGLE - EPS ||
      s.angle > MAX_ANGLE + EPS
    ) {
      throw new CheatError(
        "Aim angle is not possible"
      );
    }

    let color;

    // BOOSTER SHOT
    if (
      s.color === "bomb" ||
      s.color === "rainbow"
    ) {
      // A booster cannot consume a normal bubble swap.
      if (s.swapped) {
        throw new CheatError(
          "A booster shot cannot consume a bubble swap"
        );
      }

      used[s.color] += 1;

      if (used[s.color] > limits[s.color]) {
        throw new CheatError(
          "Booster used too many times"
        );
      }

      color = s.color;
    } else {
      // NORMAL BUBBLE SWAP
      if (s.swapped === true) {
        const previousCurrent = current;

        current = next;
        next = previousCurrent;
      }

      // Verify the bubble against the server queue.
      if (s.color !== current) {
        throw new CheatError(
          "Bubble colour does not match the queue"
        );
      }

      color = current;

      // Advance the queue exactly like the frontend.
      current = next;
      next = pickColor(board, rng);
    }

    // Recalculate shot path on the server.
    const sim = traceShot(
      board,
      LAUNCHER_X,
      LAUNCHER_Y,
      s.angle
    );

    if (!sim.cell) {
      throw new CheatError(
        "Shot cannot be placed"
      );
    }

    const cell = chooseCell(
      board,
      sim.cell,
      s.r,
      s.c
    );

    // Resolve shot.
    const result = resolveShot(
      board,
      cell.r,
      cell.c,
      color
    );

    if (result.matched) {
      combo += 1;

      bestCombo = Math.max(
        bestCombo,
        combo
      );
    } else {
      combo = 0;
    }

    score += calculateShotScore(
      result,
      Math.max(combo, 1)
    );

    removed +=
      result.popped.length +
      result.floating.length;

    floatingDropped +=
      result.floating.length;

    rescued += countRescued(result);

    completed = isObjectiveComplete(
      objective,
      {
        board,
        score,
        floatingDropped,
        bestCombo,
      }
    );

    if (
      completed ||
      countBubbles(board) === 0
    ) {
      ended = true;
    }
  }

  return {
    completed,
    score,

    stars: completed
      ? Math.max(
          1,
          calculateStars(
            score,
            level.starThresholds
          )
        )
      : 0,

    bubblesPopped: removed,
    bestCombo,
    rescued,
    shotsUsed: shots.length,
    boostersUsed: used,
  };
}
