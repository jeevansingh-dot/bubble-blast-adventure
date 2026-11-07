import assert from "node:assert/strict";
import { generateLevel } from "../src/game/levelGenerator.js";
import { boardFromLayout } from "../src/game/hexGrid.js";
import { findFloatingBubbles } from "../src/game/floatingDetector.js";
import { OBJECTIVE_TYPES } from "../src/game/objectiveManager.js";

const seen = new Set();

for (let id = 1; id <= 60; id++) {
  const lvl = generateLevel(id);
  const board = boardFromLayout(lvl.layout);
  let n = 0;
  let eggs = 0;
  const colorsOnBoard = new Set();
  board.forEach((row) =>
    row.forEach((b) => {
      if (!b) return;
      n++;
      if (b.type === "creature") eggs++;
      else colorsOnBoard.add(b.color);
    })
  );

  assert.equal(findFloatingBubbles(board).length, 0, `level ${id} has floating bubbles`);
  assert.ok(n >= 8, `level ${id} has too few bubbles (${n})`);
  assert.ok(lvl.shots >= 10 && lvl.shots < n, `level ${id} shots look wrong`);
  assert.deepEqual(generateLevel(id), lvl, `level ${id} is not repeatable`);
  assert.ok(
    lvl.starThresholds[0] < lvl.starThresholds[1] &&
      lvl.starThresholds[1] < lvl.starThresholds[2],
    `level ${id} star thresholds`
  );

  // every objective makes sense for its board
  const o = lvl.objective;
  assert.ok(OBJECTIVE_TYPES.includes(o.type), `level ${id} objective type`);
  seen.add(o.type);
  if (o.type === "rescue") assert.equal(eggs, o.target, `level ${id}: eggs match target`);
  else assert.equal(eggs, 0, `level ${id}: no eggs outside rescue levels`);
  if (o.type === "color_hunt") {
    assert.ok(o.colors.length >= 1);
    o.colors.forEach((c) => assert.ok(colorsOnBoard.has(c), `level ${id}: ${c} is on the board`));
  }
  if (o.type === "score") assert.ok(o.target > 0);
  if (id <= 5) assert.equal(o.type, "clear_all", "tutorial levels clear all");

  if (id % 5 === 0 || id <= 2 || id === 40) {
    console.log(`L${id} ${lvl.difficulty} ${o.type} colors=${lvl.colors.length} rows=${lvl.layout.length} bubbles=${n} shots=${lvl.shots}`);
  }
}

// all six objective types appear within the first 40 levels
assert.equal(seen.size, OBJECTIVE_TYPES.length, "all objective types are used");
console.log("All level tests passed");
