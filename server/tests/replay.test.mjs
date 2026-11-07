import assert from "node:assert/strict";
import { replayGame, CheatError } from "../src/services/validateSession.js";
import {
  boardFromLayout, traceShot, resolveShot, pickColor, makeRng,
  calculateShotScore, countRescued, isObjectiveComplete, countBubbles,
  BOARD_WIDTH, getLevel,
} from "../src/engine/index.js";
import { findBestShot } from "../../frontend/client/src/game/hint.js";

const X = BOARD_WIDTH / 2, Y = 540;
const MIN = (15 * Math.PI) / 180, MAX = Math.PI - MIN;

// A "browser": plays a level the same way GameCanvas does and records every shot
function playLikeBrowser(level, seed) {
  const objective = level.objective || { type: "clear_all" };
  const board = boardFromLayout(level.layout);
  const rng = makeRng(seed);
  let current = pickColor(board, rng);
  let next = pickColor(board, rng);
  const shots = [];
  let score = 0, combo = 0, bestCombo = 0, floatingDropped = 0, rescued = 0;
  let completed = false, ended = false;

  for (let i = 0; i < level.shots && !ended; i++) {
    const color = current;
    const best = findBestShot(board, X, Y, color, MIN, MAX);
    const angle = best ? best.angle : Math.PI / 2;
    const { cell } = traceShot(board, X, Y, angle);
    current = next;
    next = pickColor(board, rng);
    const res = resolveShot(board, cell.r, cell.c, color);
    combo = res.matched ? combo + 1 : 0;
    bestCombo = Math.max(bestCombo, combo);
    score += calculateShotScore(res, Math.max(combo, 1));
    floatingDropped += res.floating.length;
    rescued += countRescued(res);
    completed = isObjectiveComplete(objective, { board, score, floatingDropped, bestCombo });
    if (completed || countBubbles(board) === 0) ended = true;
    shots.push({ angle, color, r: cell.r, c: cell.c });
  }
  return { shots, score, won: completed, rescued };
}

// 1. a tiny level the bot wins at once
const tiny = { id: 99, layout: ["rr"], shots: 5, starThresholds: [10, 20, 30] };
let game = playLikeBrowser(tiny, 12345);
assert.ok(game.won);
let out = replayGame(tiny, 12345, game.shots);
assert.equal(out.completed, true);
assert.equal(out.score, game.score, "server score equals browser score");
assert.equal(out.score, 60);
assert.equal(out.stars, 3);

// 2. rescue: freeing the egg gives +100 and counts as rescued
const rescueLevel = {
  id: 98, layout: ["rr", "e"], shots: 5, starThresholds: [10, 20, 30],
  objective: { type: "rescue", target: 1 },
};
game = playLikeBrowser(rescueLevel, 7);
assert.ok(game.won, "bot rescued the chick");
out = replayGame(rescueLevel, 7, game.shots);
assert.equal(out.completed, true);
assert.equal(out.rescued, 1);
assert.equal(out.score, game.score);
assert.equal(out.score, 180, "30+30 match, 20 for the falling egg, +100 rescue");

// 3. a score level ends the moment the target is reached: more shots are cheating
const scoreLevel = {
  id: 97, layout: ["rr"], shots: 5, starThresholds: [10, 20, 30],
  objective: { type: "score", target: 10 },
};
game = playLikeBrowser(scoreLevel, 3);
assert.ok(game.won);
assert.equal(replayGame(scoreLevel, 3, game.shots).completed, true);
assert.throws(
  () => replayGame(scoreLevel, 3, [...game.shots, ...game.shots]),
  CheatError,
  "shots after the objective was completed"
);

// 4. real levels with every objective type: server must agree with the browser
for (const id of [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 30]) {
  const lvl = getLevel(id);
  for (const seed of [1, 777, 424242]) {
    const g = playLikeBrowser(lvl, seed);
    const o = replayGame(lvl, seed, g.shots);
    assert.equal(o.score, g.score, `level ${id} (${lvl.objective.type}) seed ${seed}: score matches`);
    assert.equal(o.completed, g.won, `level ${id} (${lvl.objective.type}) seed ${seed}: result matches`);
    assert.equal(o.rescued, g.rescued, `level ${id} seed ${seed}: rescued matches`);
  }
}

// 5. cheats are caught
const bad = (shots, seed = 12345, lvl = tiny) =>
  assert.throws(() => replayGame(lvl, seed, shots), CheatError);

game = playLikeBrowser(tiny, 12345);
const good = game.shots;
bad([{ ...good[0], color: "blue" }]);                      // colour not in queue
bad([{ ...good[0], angle: 0.1 }]);                         // impossible angle
bad([{ ...good[0], r: 9, c: 9 }]);                         // landing spot far away
bad([...good, ...good]);                                   // shots after the level was cleared
bad([]);                                                   // no shots at all
bad(Array(6).fill(good[0]));                               // more shots than the level has
bad([{ ...good[0], color: "bomb" }, { ...good[0], color: "bomb" }, { ...good[0], color: "bomb" }]); // booster abuse
assert.throws(() => replayGame(tiny, 12345, "nope"), CheatError);           // not even a list
assert.throws(() => replayGame(tiny, 12345, [{ angle: "x" }]), CheatError); // malformed

// 6. wrong seed = different queue = rejected
const lvl12 = getLevel(12);
const g12 = playLikeBrowser(lvl12, 5);
let rejected = false;
try { replayGame(lvl12, 6, g12.shots); } catch (e) { rejected = e instanceof CheatError; }
assert.ok(rejected, "replaying with another seed fails");

console.log("All replay tests passed");
