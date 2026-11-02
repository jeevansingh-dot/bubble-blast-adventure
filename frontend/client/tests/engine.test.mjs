import assert from "node:assert/strict";
import { boardFromLayout } from "../src/game/hexGrid.js";
import { findConnectedBubbles } from "../src/game/matchDetector.js";
import { findFloatingBubbles } from "../src/game/floatingDetector.js";
import { traceShot } from "../src/game/collision.js";
import { resolveShot } from "../src/game/shotResolver.js";
import { BOARD_WIDTH } from "../src/game/constants.js";

// 1. connected same-colour group (BFS)
let b = boardFromLayout(["rrb", "rb"]);
assert.equal(findConnectedBubbles(b, 0, 0).length, 3, "BFS group of 3 reds");

// 2. floating detection: bubble hanging with no link to ceiling
b = boardFromLayout(["r", "g"]);
b[0][0] = null;
assert.equal(findFloatingBubbles(b).length, 1, "detects floating bubble");

// 3. straight shot goes up and snaps under the formation
b = boardFromLayout(["rrrrrrrrrrr", "bbbbbbbbbb"]);
const mid = BOARD_WIDTH / 2;
let shot = traceShot(b, mid, 560, Math.PI / 2);
assert.ok(shot.cell && shot.cell.r === 2, "snaps to row 2: " + JSON.stringify(shot.cell));

// 4. wall bounce adds a bounce point
shot = traceShot(boardFromLayout([]), mid, 560, Math.PI / 2 - 1.2);
assert.ok(shot.path.length > 2, "path has a wall-bounce point");

// 5. full resolution: red next to 2 reds pops 3; green hanging below falls
b = boardFromLayout(["rr.bbbbbbbb", "g"]);
const res = resolveShot(b, 0, 2, "red");
assert.equal(res.popped.length, 3, "popped 3 reds");
assert.equal(res.floating.length, 1, "green dropped as floating");
assert.equal(res.poppedBubbles[0].color, "red", "popped bubbles carry colour");

// 6. bomb pops its neighbours (and nothing is attached to the board)
b = boardFromLayout(["rrrrrrrrrrr", "bbbbbbbbbb"]);
let bomb = resolveShot(b, 2, 2, "bomb");
assert.equal(bomb.special, "bomb");
assert.equal(bomb.popped.length, 2, "bomb popped 2 neighbours");
assert.equal(b[1][1], null, "neighbour removed");
assert.equal(b[2][2], null, "bomb itself does not stay");

// 7. bomb can also make bubbles float
b = boardFromLayout(["r", "g", "b"]); // chain r - g - b hanging from the ceiling
bomb = resolveShot(b, 0, 1, "bomb"); // pops r and g
assert.equal(bomb.floating.length, 1, "blue lost its support and falls");

// 8. rainbow takes the colour that makes a match
b = boardFromLayout(["rr"]);
const rb = resolveShot(b, 0, 2, "rainbow");
assert.equal(rb.special, "rainbow");
assert.equal(rb.popped.length, 3, "rainbow matched with the reds");

console.log("All engine tests passed");