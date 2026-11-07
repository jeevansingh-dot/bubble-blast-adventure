import assert from "node:assert/strict";
import { boardFromLayout } from "../src/game/hexGrid.js";
import { pickColor } from "../src/game/bubbleQueue.js";
import { makeRng } from "../src/game/rng.js";
import { resolveShot } from "../src/game/shotResolver.js";
import { calculateShotScore, countRescued } from "../src/game/scoreManager.js";
import { isObjectiveComplete, objectiveProgress } from "../src/game/objectiveManager.js";

const state = (board, extra = {}) => ({ board, score: 0, floatingDropped: 0, bestCombo: 0, ...extra });

// 'e' in a layout is a baby chick egg (a creature, not a normal bubble)
let b = boardFromLayout(["rre", "ge"]);
assert.equal(b[0][2].type, "creature");
assert.equal(b[0][2].color, "egg");

// the player is never given an egg to shoot
const rng = makeRng(1);
for (let i = 0; i < 200; i++) assert.notEqual(pickColor(b, rng), "egg");

// rainbow never turns into an egg
b = boardFromLayout(["e"]);
resolveShot(b, 0, 1, "rainbow");
assert.notEqual(b[0][1].color, "egg");

// rescue: an egg that falls is rescued (+100 points each)
b = boardFromLayout(["rr", "e"]); // egg (1,0) is held up only by red (0,0)
let res = resolveShot(b, 0, 2, "red"); // pop the 3 reds
assert.equal(res.popped.length, 3);
assert.equal(res.floating.length, 1, "egg fell");
assert.equal(countRescued(res), 1);
const plain = calculateShotScore({ ...res, poppedBubbles: [], floatingBubbles: [] }, 1);
assert.equal(calculateShotScore(res, 1), plain + 100, "rescue bonus is +100");
assert.equal(isObjectiveComplete({ type: "rescue", target: 1 }, state(b)), true);

// bomb also frees eggs
b = boardFromLayout(["rrr", "e"]);
res = resolveShot(b, 1, 1, "bomb");
assert.ok(countRescued(res) >= 1, "bomb freed the egg");

// the other objective types
b = boardFromLayout(["rb", "gg"]);
assert.equal(isObjectiveComplete({ type: "clear_all" }, state(b)), false);
assert.equal(isObjectiveComplete({ type: "color_hunt", colors: ["purple"] }, state(b)), true);
assert.equal(isObjectiveComplete({ type: "color_hunt", colors: ["red"] }, state(b)), false);
assert.equal(isObjectiveComplete({ type: "score", target: 500 }, state(b, { score: 499 })), false);
assert.equal(isObjectiveComplete({ type: "score", target: 500 }, state(b, { score: 500 })), true);
assert.equal(isObjectiveComplete({ type: "drop", target: 8 }, state(b, { floatingDropped: 8 })), true);
assert.equal(isObjectiveComplete({ type: "combo", target: 3 }, state(b, { bestCombo: 2 })), false);
assert.equal(isObjectiveComplete({ type: "combo", target: 3 }, state(b, { bestCombo: 3 })), true);
assert.equal(isObjectiveComplete(undefined, state(boardFromLayout([]))), true, "default = clear all");

// the HUD text
assert.match(objectiveProgress({ type: "rescue", target: 2 }, state(boardFromLayout(["e", "e"]))), /0\/2 rescued/);
assert.match(objectiveProgress({ type: "score", target: 800 }, state(b, { score: 100 })), /100\/800/);

console.log("All objective tests passed");
