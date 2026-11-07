// The server re-plays every game with the SAME engine files the browser uses,
// so scoring rules live in one place only (frontend/client/src/game).
// If your folders are named differently, change the paths here (nowhere else).
export { boardFromLayout, getNeighbors, forEachBubble } from "../../../frontend/client/src/game/hexGrid.js";
export { traceShot } from "../../../frontend/client/src/game/collision.js";
export { resolveShot } from "../../../frontend/client/src/game/shotResolver.js";
export {
  calculateShotScore,
  countRescued,
  calculateStars,
} from "../../../frontend/client/src/game/scoreManager.js";
export {
  isObjectiveComplete,
  countBubbles,
} from "../../../frontend/client/src/game/objectiveManager.js";
export { pickColor } from "../../../frontend/client/src/game/bubbleQueue.js";
export { makeRng } from "../../../frontend/client/src/game/rng.js";
export { BOARD_WIDTH } from "../../../frontend/client/src/game/constants.js";
export { getLevel } from "../../../frontend/client/src/data/levels.js";