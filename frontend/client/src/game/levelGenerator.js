import { COLORS, LETTER_TO_COLOR } from "./constants.js";
import { boardFromLayout, colsInRow } from "./hexGrid.js";
import { findFloatingBubbles } from "./floatingDetector.js";

const COLOR_TO_LETTER = Object.fromEntries(
  Object.entries(LETTER_TO_COLOR).map(([letter, color]) => [color, letter])
);

// Small seeded random generator: same level id always gives the same level
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function difficultyOf(id) {
  if (id <= 5) return "tutorial";
  if (id <= 10) return "beginner";
  if (id <= 20) return "easy";
  if (id <= 30) return "medium";
  if (id <= 35) return "hard";
  return "expert";
}

// Levels 1 to 5 teach the basics (clear all). After that the objective changes every level.
const OBJECTIVE_CYCLE = ["clear_all", "rescue", "color_hunt", "score", "drop", "combo"];
export const objectiveTypeOf = (id) =>
  id <= 5 ? "clear_all" : OBJECTIVE_CYCLE[(id - 6) % OBJECTIVE_CYCLE.length];

// Fewer shots per bubble = harder
const SHOT_FACTOR = {
  tutorial: 0.75,
  beginner: 0.7,
  easy: 0.65,
  medium: 0.6,
  hard: 0.56,
  expert: 0.52,
};

// Few colours early on, all 6 later
function colorCountOf(id) {
  if (id <= 2) return 3;
  if (id <= 9) return 4;
  if (id <= 20) return 5;
  return 6;
}

// More rows as levels go up (never more than 9, launcher needs space)
const rowCountOf = (id) => Math.min(9, 3 + Math.floor(id / 6));

const round10 = (n) => Math.round(n / 10) * 10;

export function generateLevel(id) {
  const rng = makeRng(id * 7919 + 13);
  const difficulty = difficultyOf(id);

  // pick which colours this level uses (shuffled so levels feel different)
  const pool = [...COLORS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const colors = pool.slice(0, colorCountOf(id));
  const letters = colors.map((c) => COLOR_TO_LETTER[c]);

  const rows = rowCountOf(id);
  const taper = [0, 0.8, 1.4][id % 3]; // 0 = full block, bigger = narrower triangle
  const repeat = Math.max(0.25, 0.5 - id * 0.006); // higher = bigger same-colour clusters

  const layout = [];
  for (let r = 0; r < rows; r++) {
    const len = colsInRow(r);
    const maxInset = Math.floor((len - 2) / 2);
    const inset = Math.min(Math.floor((r * taper) / 2), maxInset);
    const above = layout[r - 1] || "";
    let row = "";
    let prev = null;

    for (let c = 0; c < len; c++) {
      if (c < inset || c >= len - inset) {
        row += ".";
        prev = null;
        continue;
      }
      const roll = rng();
      const up = above[c];
      let letter;
      if (prev && roll < repeat) letter = prev;
      else if (up && up !== "." && roll < repeat + 0.1) letter = up;
      else letter = letters[Math.floor(rng() * letters.length)];
      row += letter;
      prev = letter;
    }
    layout.push(row);
  }

  // safety: remove any bubble that would start out hanging in the air
  const board = boardFromLayout(layout);
  findFloatingBubbles(board).forEach(([r, c]) => (board[r][c] = null));

  // ---- objective ----
  let type = objectiveTypeOf(id);
  let objective = { type: "clear_all" };

  if (type === "rescue") {
    // hide baby chicks (eggs) inside the formation, never in the top row
    const cells = [];
    for (let r = 1; r < rows; r++) {
      board[r].forEach((b, c) => {
        if (b) cells.push([r, c]);
      });
    }
    const eggCount = Math.min(5, 2 + Math.floor(id / 12));
    if (cells.length >= eggCount + 6) {
      for (let k = 0; k < eggCount; k++) {
        const [r, c] = cells.splice(Math.floor(rng() * cells.length), 1)[0];
        board[r][c] = { color: "egg", type: "creature" };
      }
      objective = { type: "rescue", target: eggCount };
    } else {
      type = "clear_all";
    }
  }

  let count = 0;
  const perColor = {};
  board.slice(0, rows).forEach((row) =>
    row.forEach((b) => {
      if (!b) return;
      count++;
      if (b.type !== "creature") perColor[b.color] = (perColor[b.color] || 0) + 1;
    })
  );

  if (type === "color_hunt") {
    const options = Object.keys(perColor).filter((c) => perColor[c] >= 3);
    let k = id < 22 ? 1 : 2;
    if (options.length < 2) k = 1;
    if (options.length === 0) {
      type = "clear_all";
    } else {
      const picked = [];
      for (let i = 0; i < k; i++) {
        picked.push(options.splice(Math.floor(rng() * options.length), 1)[0]);
      }
      objective = { type: "color_hunt", colors: picked };
    }
  } else if (type === "score") {
    objective = { type: "score", target: round10(count * 11) };
  } else if (type === "drop") {
    objective = { type: "drop", target: Math.max(6, Math.round(count * 0.2)) };
  } else if (type === "combo") {
    objective = { type: "combo", target: id < 25 ? 3 : id < 36 ? 4 : 5 };
  }

  // star thresholds depend on the objective (a score level ends earlier than "clear all")
  let starThresholds;
  switch (objective.type) {
    case "rescue": {
      const base = objective.target * 100;
      starThresholds = [round10(base + count * 3), round10(base + count * 8), round10(base + count * 14)];
      break;
    }
    case "color_hunt":
      starThresholds = [round10(count * 4), round10(count * 9), round10(count * 15)];
      break;
    case "score":
      starThresholds = [
        objective.target,
        round10(objective.target * 1.4),
        round10(objective.target * 1.9),
      ];
      break;
    case "drop":
    case "combo":
      starThresholds = [round10(count * 5), round10(count * 10), round10(count * 16)];
      break;
    default:
      starThresholds = [round10(count * 10), round10(count * 22), round10(count * 32)];
  }

  const finalLayout = board.slice(0, rows).map((row) =>
    row.map((b) => (b ? COLOR_TO_LETTER[b.color] : ".")).join("")
  );

  return {
    id,
    difficulty,
    objective,
    shots: Math.max(10, Math.ceil(count * SHOT_FACTOR[difficulty])),
    colors,
    starThresholds,
    layout: finalLayout,
  };
}