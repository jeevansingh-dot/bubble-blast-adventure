export const BUBBLE_RADIUS = 20;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const COLS = 11; // even rows have 11 cells, odd rows have 10
export const MAX_ROWS = 14; // bubbles reaching this row = danger line
export const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);
export const BOARD_WIDTH = COLS * BUBBLE_DIAMETER;

export const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];

// Letters used in level layouts (data-driven levels)
export const LETTER_TO_COLOR = {
  r: "red",
  b: "blue",
  g: "green",
  y: "yellow",
  p: "purple",
  o: "orange",
};