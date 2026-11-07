import { BUBBLE_RADIUS as R } from "./constants.js";
import { cellToPixel, forEachBubble } from "./hexGrid.js";

export const COLOR_HEX = {
  red: "#ff4d5e",
  blue: "#3d8bff",
  green: "#37d67a",
  yellow: "#ffd93d",
  purple: "#a95cff",
  orange: "#ff9a3d",
  bomb: "#3a3a52",
  rainbow: "#ff7ad9",
  egg: "#ffe6b8",
};

// A baby chick egg (rescue levels): cream shell with a little chick inside
function drawEgg(ctx, x, y, radius) {
  const shell = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.35,
    radius * 0.1,
    x,
    y,
    radius
  );
  shell.addColorStop(0, "#ffffff");
  shell.addColorStop(1, "#ffd9a0");

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = shell;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#e0a64a";
  ctx.stroke();

  ctx.save();
  ctx.font = `${Math.round(radius * 1.15)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🐣", x, y + 1);
  ctx.restore();
}

// One glossy bubble (also draws Bomb, Rainbow and the rescue egg)
export function drawBubble(ctx, x, y, color, radius = R - 1) {
  if (color === "egg") {
    drawEgg(ctx, x, y, radius);
    return;
  }

  const base = COLOR_HEX[color] || "#cccccc";

  let fill;
  if (color === "rainbow") {
    fill = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
    fill.addColorStop(0, "#ff4d5e");
    fill.addColorStop(0.25, "#ffd93d");
    fill.addColorStop(0.5, "#37d67a");
    fill.addColorStop(0.75, "#3d8bff");
    fill.addColorStop(1, "#a95cff");
  } else {
    fill = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.1,
      x,
      y,
      radius
    );
    fill.addColorStop(0, "rgba(255,255,255,0.95)");
    fill.addColorStop(0.3, base);
    fill.addColorStop(1, base);
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  if (color === "rainbow") {
    // glossy highlight on top of the rainbow colours
    const gloss = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.05,
      x,
      y,
      radius
    );
    gloss.addColorStop(0, "rgba(255,255,255,0.85)");
    gloss.addColorStop(0.45, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gloss;
    ctx.fill();
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.stroke();

  if (color === "bomb") {
    ctx.save();
    ctx.font = `${Math.round(radius * 1.1)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💣", x, y + 1);
    ctx.restore();
  }
}

// Every bubble currently on the board
export function drawBoard(ctx, board) {
  forEachBubble(board, (bubble, r, c) => {
    const { x, y } = cellToPixel(r, c);
    drawBubble(ctx, x, y, bubble.color);
  });
}

// Dotted aim line (follows wall bounces because `path` contains bounce points)
export function drawTrajectory(ctx, path) {
  if (path.length < 2) return;
  ctx.save();
  ctx.setLineDash([2, 12]);
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  ctx.stroke();
  ctx.restore();
}

// Launcher: rotating barrel + current bubble + small "next" bubble
export function drawLauncher(ctx, x, y, angle, currentColor, nextColor) {
  // barrel (rotates toward the aim angle)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 2 - angle);
  ctx.fillStyle = "#5b4bd6";
  ctx.fillRect(-9, -52, 18, 52);
  ctx.restore();

  // base
  ctx.beginPath();
  ctx.arc(x, y + 10, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#3a2d9c";
  ctx.fill();

  // current bubble (ready to shoot)
  drawBubble(ctx, x, y, currentColor);

  // next bubble preview
  drawBubble(ctx, x - 70, y + 14, nextColor, 13);
  ctx.fillStyle = "white";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEXT", x - 70, y + 40);
}

// Hint: golden line along the suggested shot + a ring on the target cell
export function drawHint(ctx, path, cell) {
  if (path.length < 2) return;

  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ffd93d";
  ctx.shadowColor = "rgba(255,217,61,0.9)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  ctx.stroke();
  ctx.restore();

  if (cell) {
    const { x, y } = cellToPixel(cell.r, cell.c);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffd93d";
    ctx.shadowColor = "rgba(255,217,61,0.9)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, R + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}