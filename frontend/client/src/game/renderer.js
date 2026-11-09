// src/game/renderer.js

// Color map for bubbles
export const COLOR_HEX = {
  R: '#ef4444', // Red
  G: '#10b981', // Green
  B: '#3b82f6', // Blue
  Y: '#f59e0b', // Yellow
  P: '#ec4899', // Purple
  O: '#f97316', // Orange
  C: '#06b6d4', // Cyan
};

// Fallback color mapper
export function getColorHex(colorCode) {
  if (!colorCode) return '#64748b';
  if (colorCode.startsWith('#')) return colorCode;
  return COLOR_HEX[colorCode.toUpperCase()] || colorCode;
}

// 3D Glossy Bubble Renderer with Radial Gradients & Specular Highlights
export function drawBubble(ctx, x, y, radius, colorInput) {
  const color = getColorHex(colorInput);
  ctx.save();
  
  // Outer Neon Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  // Radial Gradient for 3D Sphere Shading
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3, y - radius * 0.3, radius * 0.05,
    x, y, radius
  );
  gradient.addColorStop(0, '#ffffff'); // Highlight core
  gradient.addColorStop(0.35, color);  // Base bubble color
  gradient.addColorStop(1, adjustBrightness(color, -55)); // Darker edge shade

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Glossy Specular Reflection (Glass Shine)
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fill();

  ctx.restore();
}

// Utility to calculate darker shade for edges
function adjustBrightness(hex, percent) {
  if (!hex || !hex.startsWith('#')) return '#1e293b';
  let num = parseInt(hex.replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
    (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
    (B < 0 ? 0 : B > 255 ? B : 255)
  ).toString(16).slice(1)}`;
}

// Board Renderer
export function drawBoard(ctx, board, hexRadius) {
  if (!board || !board.grid) return;
  
  const grid = board.grid;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const bubble = grid[row][col];
      if (bubble && bubble.color) {
        const x = bubble.x || (col * hexRadius * 1.732 + (row % 2 === 1 ? hexRadius * 0.866 : 0) + hexRadius);
        const y = bubble.y || (row * hexRadius * 1.5 + hexRadius);
        drawBubble(ctx, x, y, hexRadius - 1, bubble.color);
      }
    }
  }
}

// Hint Renderer
export function drawHint(ctx, hint) {
  if (!hint) return;
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  if (hint.x && hint.y) {
    ctx.arc(hint.x, hint.y, hint.radius || 20, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

// Launcher Renderer (Fixes the missing export error in GameCanvas.jsx)
export function drawLauncher(ctx, launcher) {
  if (!launcher) return;
  ctx.save();
  const { x, y, angle } = launcher;
  
  // Draw base cannon/launcher mount
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();

  // Draw barrel pointing towards angle
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(-12, -35, 24, 40);
  ctx.restore();

  ctx.restore();
}
// Trajectory / Aiming Line Renderer (Fixes the missing export error in GameCanvas.jsx)
export function drawTrajectory(ctx, trajectory) {
  if (!trajectory || !Array.isArray(trajectory) || trajectory.length === 0) return;
  
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  
  ctx.beginPath();
  ctx.moveTo(trajectory[0].x, trajectory[0].y);
  for (let i = 1; i < trajectory.length; i++) {
    ctx.lineTo(trajectory[i].x, trajectory[i].y);
  }
  ctx.stroke();
  ctx.restore();
}