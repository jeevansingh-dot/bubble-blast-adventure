import { forEachBubble } from "./hexGrid.js";

// Objective types a level can have:
//   clear_all   { type }                    clear every bubble
//   rescue      { type, target }            free all baby chicks (eggs)
//   color_hunt  { type, colors: [...] }     clear every bubble of these colours
//   score       { type, target }            reach a score
//   drop        { type, target }            make this many bubbles fall
//   combo       { type, target }            reach this combo
export const OBJECTIVE_TYPES = ["clear_all", "rescue", "color_hunt", "score", "drop", "combo"];

function count(board, test) {
  let n = 0;
  forEachBubble(board, (b) => {
    if (test(b)) n++;
  });
  return n;
}

export const countBubbles = (board) => count(board, () => true);
export const countCreatures = (board) => count(board, (b) => b.type === "creature");

// state = { board, score, floatingDropped, bestCombo }
export function isObjectiveComplete(objective, state) {
  const o = objective || { type: "clear_all" };
  switch (o.type) {
    case "rescue":
      return countCreatures(state.board) === 0;
    case "color_hunt":
      return count(state.board, (b) => o.colors.includes(b.color)) === 0;
    case "score":
      return state.score >= o.target;
    case "drop":
      return state.floatingDropped >= o.target;
    case "combo":
      return state.bestCombo >= o.target;
    default:
      return countBubbles(state.board) === 0;
  }
}

// One line for the HUD, e.g. "🐣 Rescue 3 chicks · 1/3 rescued"
export function objectiveProgress(objective, state) {
  const o = objective || { type: "clear_all" };
  switch (o.type) {
    case "rescue": {
      const left = countCreatures(state.board);
      return `🐣 Rescue ${o.target} chicks · ${Math.max(0, o.target - left)}/${o.target} rescued`;
    }
    case "color_hunt": {
      const left = count(state.board, (b) => o.colors.includes(b.color));
      return `🎨 Clear all ${o.colors.join(" & ")} bubbles · ${left} left`;
    }
    case "score":
      return `⭐ Reach ${o.target} points · ${Math.min(state.score, o.target)}/${o.target}`;
    case "drop":
      return `⬇️ Drop ${o.target} bubbles · ${Math.min(state.floatingDropped, o.target)}/${o.target}`;
    case "combo":
      return `🔥 Reach combo x${o.target} · best x${state.bestCombo}`;
    default:
      return `🫧 Clear all bubbles · ${countBubbles(state.board)} left`;
  }
}