import { BUBBLE_RADIUS as R } from "./constants.js";
import { drawBubble, COLOR_HEX } from "./renderer.js";

// All running animations live in one object
export function createEffects() {
  return { popping: [], particles: [], falling: [] };
}

// Bubble that popped: swells + fades, and throws 8 particles
export function addPop(effects, x, y, color) {
  effects.popping.push({ x, y, color, age: 0, life: 12 });
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    effects.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 3 + Math.random() * 3,
      age: 0,
      life: 24 + Math.random() * 10,
    });
  }
}

// Bubble that lost its support: falls down while spinning
export function addFall(effects, x, y, color) {
  effects.falling.push({
    x,
    y,
    color,
    vx: (Math.random() - 0.5) * 2,
    vy: -2, // tiny hop upwards before falling
    rot: 0,
    vr: (Math.random() - 0.5) * 0.3,
    alpha: 1,
  });
}

// Call once per frame
export function updateEffects(effects) {
  for (const p of effects.popping) p.age++;
  effects.popping = effects.popping.filter((p) => p.age < p.life);

  for (const p of effects.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.age++;
  }
  effects.particles = effects.particles.filter((p) => p.age < p.life);

  for (const f of effects.falling) {
    f.vy += 0.5; // gravity
    f.x += f.vx;
    f.y += f.vy;
    f.rot += f.vr;
    if (f.y > 450) f.alpha -= 0.06; // fade near the bottom
  }
  effects.falling = effects.falling.filter((f) => f.alpha > 0 && f.y < 700);
}

export function hasActiveEffects(effects) {
  return (
    effects.popping.length > 0 ||
    effects.particles.length > 0 ||
    effects.falling.length > 0
  );
}

export function drawEffects(ctx, effects) {
  // popping bubbles
  for (const p of effects.popping) {
    const t = p.age / p.life;
    ctx.globalAlpha = 1 - t;
    drawBubble(ctx, p.x, p.y, p.color, (R - 1) * (1 + t * 0.5));
  }

  // particles
  for (const p of effects.particles) {
    ctx.globalAlpha = 1 - p.age / p.life;
    ctx.fillStyle = COLOR_HEX[p.color] || "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // falling bubbles (rotating)
  for (const f of effects.falling) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.alpha);
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    drawBubble(ctx, 0, 0, f.color);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}