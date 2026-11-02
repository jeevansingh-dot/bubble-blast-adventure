import { generateLevel } from "../game/levelGenerator.js";

// Levels are plain data. Levels 1-5 are hand made (tutorial),
// levels 6-40 come from the level generator, and any level above 40
// is generated on the fly (auto level generation).
// layout letters: r=red b=blue g=green y=yellow p=purple o=orange  ('.' = empty)
// starThresholds = score needed for 1, 2 and 3 stars

const HAND_MADE = [
  {
    id: 1,
    difficulty: "tutorial",
    objective: { type: "clear_all" },
    shots: 20,
    colors: ["red", "blue", "green"],
    starThresholds: [200, 400, 600],
    layout: ["rrrbbbgggrr", "rrbbbgggrr", "rrbbgggrrb"],
  },
  {
    id: 2,
    difficulty: "tutorial",
    objective: { type: "clear_all" },
    shots: 20,
    colors: ["red", "blue", "green"],
    starThresholds: [300, 600, 900],
    layout: ["rrbbggrrbbg", "rbbggrrbbg", "bbggrrbbggr", "bggrrbbgg"],
  },
  {
    id: 3,
    difficulty: "tutorial",
    objective: { type: "clear_all" },
    shots: 22,
    colors: ["red", "blue", "green", "yellow"],
    starThresholds: [400, 800, 1200],
    layout: ["rrrbbbyyygg", "rrbbyyygg", "rbbyyyggrr", "bbyyggrrb"],
  },
  {
    id: 4,
    difficulty: "tutorial",
    objective: { type: "clear_all" },
    shots: 24,
    colors: ["red", "blue", "green", "yellow"],
    starThresholds: [500, 1000, 1500],
    layout: ["rrbbggyyrrb", "rbbggyyrrb", "bbggyyrrbbg", "bggyyrrbb", "ggyyrrb"],
  },
  {
    id: 5,
    difficulty: "tutorial",
    objective: { type: "clear_all" },
    shots: 26,
    colors: ["red", "blue", "green", "yellow", "purple"],
    starThresholds: [600, 1200, 1800],
    layout: [
      "rrbbggyyppo",
      "rbbggyyppo",
      "bbggyyppoor",
      "bggyyppoo",
      "ggyyppoor",
      "gyyppoor",
    ],
  },
];

export const LEVEL_COUNT = 40;

export const LEVELS = Array.from({ length: LEVEL_COUNT }, (_, i) => {
  const id = i + 1;
  return HAND_MADE.find((l) => l.id === id) || generateLevel(id);
});

// Any id works: levels above 40 are generated automatically
export const getLevel = (id) =>
  LEVELS.find((l) => l.id === id) || generateLevel(id);