
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  boardFromLayout,
  cellToPixel,
  forEachBubble,
} from "../game/hexGrid.js";

import { traceShot } from "../game/collision.js";
import { resolveShot } from "../game/shotResolver.js";
import {
  calculateShotScore,
  calculateStars,
} from "../game/scoreManager.js";
import {
  isObjectiveComplete,
  countBubbles,
} from "../game/objectiveManager.js";
import { pickColor } from "../game/bubbleQueue.js";
import { makeRng } from "../game/rng.js";
import {
  BOARD_WIDTH,
  BUBBLE_RADIUS,
} from "../game/constants.js";

const W = BOARD_WIDTH;
const H = 600;
const R = BUBBLE_RADIUS;

const LAUNCHER_X = W / 2;
const LAUNCHER_Y = 540;

const MIN_ANGLE = (15 * Math.PI) / 180;
const MAX_ANGLE = (165 * Math.PI) / 180;

const COLOR_MAP = {
  red: "#ec4899",
  blue: "#38bdf8",
  green: "#10b981",
  yellow: "#fbbf24",
  purple: "#a855f7",
  orange: "#f97316",
  egg: "#fef3c7",
  bomb: "#ef4444",
  rainbow: "#a855f7",
};

const BEST_SCORE_KEY = "bubbleBlastAdventureBestScore";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawBubble(ctx, x, y, color, radius = R) {
  if (!color) return;

  const fill = COLOR_MAP[color] || color;

  const gradient = ctx.createRadialGradient(
    x - 6, y - 6, 2, x, y, radius
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, fill);
  gradient.addColorStop(1, fill);

  ctx.save();
  ctx.shadowColor = fill;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x - 5, y - 6, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.fill();
}

function createGame(level, seed) {
  const board = boardFromLayout(level.layout);
  const rng = makeRng(seed);

  return {
    board,
    rng,
    current: pickColor(board, rng),
    next: pickColor(board, rng),
    score: 0,
    shots: level.shots,
    initialShots: level.shots,
    combo: 0,
    bestCombo: 0,
    floatingDropped: 0,
    angle: Math.PI / 2,
    swappedSinceShot: false,
    shotsHistory: [],
    boosters: { bomb: 2, rainbow: 2 },
    armed: null,
    status: "READY",
    level,
    effects: [],
    flyingBubble: null,
    paused: false,
  };
}

export default function GameCanvas({
  levelId = 1,
  level = null,
  seed,
  saveStatus = {
    state: "idle",
    message: "",
    canRetry: false,
  },
  onFinish = null,
  onRetrySave = null,
  onRestart = null,
  onNext = null,
  onExit = null,
  onLevelsClick = null,
}) {
  const actualLevel = level || {
    id: levelId,
    layout: [],
    shots: 20,
    objective: { type: "clear_all" },
    starThresholds: [200, 400, 600],
  };

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const finishReportedRef = useRef(false);
  const animationRef = useRef(null);
  const shotLockRef = useRef(false);
  const pointerDownRef = useRef(false);

  const audioContextRef = useRef(null);
  const musicTimerRef = useRef(null);
  const musicStepRef = useRef(0);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const [hud, setHud] = useState(null);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(false);
  const [sound, setSound] = useState(true);

  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  const [hintCount, setHintCount] = useState(3);

  const starThresholds =
    actualLevel.starThresholds || [200, 400, 600];

  // AUDIO

  const getAudioContext = useCallback(() => {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    return ctx;
  }, []);

  const playTone = useCallback(
    (frequency, duration = 0.12, type = "sine", volume = 0.06) => {
      if (!sound) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        ctx.currentTime
      );

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    },
    [sound, getAudioContext]
  );

  const playShootSound = useCallback(() => {
    playTone(420, 0.1, "triangle", 0.07);
  }, [playTone]);

  const playPopSound = useCallback(() => {
    playTone(700, 0.1, "sine", 0.07);
    setTimeout(() => {
      playTone(950, 0.12, "sine", 0.05);
    }, 65);
  }, [playTone]);

  const startMusic = useCallback(() => {
    if (!sound || musicTimerRef.current) return;

    const notes = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880, 698.46,
    ];

    getAudioContext();

    musicTimerRef.current = setInterval(() => {
      if (!sound) return;

      playTone(
        notes[musicStepRef.current++ % notes.length],
        0.22,
        "sine",
        0.025
      );
    }, 300);
  }, [sound, getAudioContext, playTone]);

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) {
      clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  // DRAW

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const g = gameRef.current;

    if (!canvas || !g) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,.35)";

    for (let i = 0; i < 30; i++) {
      ctx.fillRect(
        (i * 83 + 19) % W,
        (i * 47 + 13) % H,
        1.5,
        1.5
      );
    }

    // Board
    forEachBubble(g.board, (bubble, r, c) => {
      const pos = cellToPixel(r, c);
      drawBubble(ctx, pos.x, pos.y, bubble.color);
    });

    // Aim line remains active during flight
    if (g.status === "READY" && !g.paused) {
      const trajectory = traceShot(
        g.board,
        LAUNCHER_X,
        LAUNCHER_Y,
        g.angle
      );

      if (trajectory.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(
          trajectory.path[0].x,
          trajectory.path[0].y
        );

        trajectory.path.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });

        ctx.strokeStyle = "rgba(255,255,255,.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Flying bubble
    if (g.flyingBubble) {
      const b = g.flyingBubble;

      const progress = clamp(
        (performance.now() - b.start) / b.duration,
        0,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      drawBubble(
        ctx,
        b.startX + (b.endX - b.startX) * eased,
        b.startY + (b.endY - b.startY) * eased,
        b.color,
        R
      );
    }

    // Removed bubble effects
    const now = performance.now();

    g.effects = g.effects.filter((effect) => {
      const progress =
        (now - effect.start) / effect.duration;

      if (progress < 0) return true;
      if (progress >= 1) return false;

      const fall = effect.falling
        ? progress * 105
        : progress * 8;

      const radius = effect.falling
        ? R * (1 - progress * 0.3)
        : R * (1 - progress * 0.65);

      ctx.globalAlpha = 1 - progress;

      drawBubble(
        ctx,
        effect.x,
        effect.y + fall,
        effect.color,
        Math.max(2, radius)
      );

      ctx.globalAlpha = 1;
      return true;
    });

    // Launcher
    ctx.save();
    ctx.translate(LAUNCHER_X, LAUNCHER_Y);
    ctx.rotate(-g.angle);
    ctx.fillStyle = "#7dd3fc";
    ctx.fillRect(0, -7, 38, 14);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(LAUNCHER_X, LAUNCHER_Y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    ctx.strokeStyle = g.armed ? "#fbbf24" : "#38bdf8";
    ctx.lineWidth = 3;
    ctx.stroke();

    drawBubble(
      ctx,
      LAUNCHER_X,
      LAUNCHER_Y,
      g.armed || g.current,
      15
    );

    // Danger line
    ctx.beginPath();
    ctx.moveTo(0, H - 115);
    ctx.lineTo(W, H - 115);
    ctx.strokeStyle = "rgba(248,113,113,.5)";
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // HUD

  const sync = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;

    setHud({
      score: g.score,
      shots: g.shots,
      combo: g.combo,
      bestCombo: g.bestCombo,
      current: g.current,
      next: g.next,
      boosters: { ...g.boosters },
      armed: g.armed,
      outcome: g.status === "READY" ? null : g.status,
      stars: calculateStars(g.score, starThresholds),
    });

    setBestScore((old) => Math.max(old, g.score));
    draw();
  }, [draw, starThresholds]);

  // FINISH

  const finishGame = useCallback(
    (outcome) => {
      const g = gameRef.current;

      if (!g || g.status !== "READY") return;

      g.status = outcome;
      g.flyingBubble = null;

      shotLockRef.current = false;
      pointerDownRef.current = false;

      setPaused(false);
      stopMusic();

      if (outcome === "WON") {
        playTone(783.99, 0.2, "sine", 0.08);

        setTimeout(() => {
          playTone(1046.5, 0.3, "sine", 0.08);
        }, 180);
      }

      sync();

      if (outcome === "WON" && !finishReportedRef.current) {
        finishReportedRef.current = true;

        onFinishRef.current?.({
          score: g.score,
          shots: g.shotsHistory,
          outcome: "WON",
        });
      }
    },
    [sync, stopMusic, playTone]
  );

  const checkObjective = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.status !== "READY") return;

    const completed = isObjectiveComplete(
      g.level.objective,
      {
        board: g.board,
        score: g.score,
        floatingDropped: g.floatingDropped,
        bestCombo: g.bestCombo,
      }
    );

    if (completed) {
      finishGame("WON");
      return;
    }

    if (countBubbles(g.board) === 0) {
      finishGame("LOST");
      return;
    }

    if (g.shots <= 0) {
      finishGame("LOST");
      return;
    }

    let lowest = 0;

    forEachBubble(g.board, (_, r) => {
      const pos = cellToPixel(r, 0);
      lowest = Math.max(lowest, pos.y);
    });

    if (lowest >= H - 105) {
      finishGame("LOST");
    }
  }, [finishGame]);

  // AIM

  const aim = useCallback((event) => {
    const g = gameRef.current;
    const canvas = canvasRef.current;

    if (!g || !canvas || g.status !== "READY" || g.paused) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;

    const angle = Math.atan2(
      LAUNCHER_Y - y,
      x - LAUNCHER_X
    );

    g.angle = clamp(angle, MIN_ANGLE, MAX_ANGLE);
    draw();
  }, [draw]);

  // SHOOT

  const shoot = useCallback(() => {
    const g = gameRef.current;

    if (
      !g ||
      g.status !== "READY" ||
      g.paused ||
      shotLockRef.current
    ) {
      return;
    }

    if (g.shots <= 0) return;

    const special = g.armed;

    if (special && g.boosters[special] <= 0) return;

    const color = special || g.current;
    const angle = g.angle;

    const simulation = traceShot(
      g.board,
      LAUNCHER_X,
      LAUNCHER_Y,
      angle
    );

    if (!simulation.cell) return;

    const { r, c } = simulation.cell;
    const target = cellToPixel(r, c);

    // Lock only firing, never aiming.
    shotLockRef.current = true;

    if (special) {
      g.boosters[special]--;
      g.armed = null;
    } else {
      g.current = g.next;
      g.next = pickColor(g.board, g.rng);
    }

    g.flyingBubble = {
      startX: LAUNCHER_X,
      startY: LAUNCHER_Y,
      endX: target.x,
      endY: target.y,
      color,
      start: performance.now(),
      duration: 230,
    };

    startMusic();
    playShootSound();

    // Exact server replay record
    g.shotsHistory.push({
      angle,
      color,
      r,
      c,
      swapped: g.swappedSinceShot,
    });

    g.swappedSinceShot = false;
    g.shots--;

    const previousBoard = g.board.map((row) =>
      row.map((bubble) =>
        bubble ? { ...bubble } : null
      )
    );

    const result = resolveShot(g.board, r, c, color);

    let removedCount = 0;

    previousBoard.forEach((row, rowIndex) => {
      row.forEach((bubble, colIndex) => {
        if (!bubble || g.board[rowIndex]?.[colIndex]) {
          return;
        }

        const pos = cellToPixel(rowIndex, colIndex);

        g.effects.push({
          x: pos.x,
          y: pos.y,
          color: bubble.color,
          start: performance.now() + 230,
          duration: 500,
          falling: true,
        });

        removedCount++;
      });
    });

    if (removedCount > 0) {
      playPopSound();
    }

    if (result.matched) {
      g.combo++;
      g.bestCombo = Math.max(g.bestCombo, g.combo);
    } else {
      g.combo = 0;
    }

    g.score += calculateShotScore(
      result,
      Math.max(g.combo, 1)
    );

    g.floatingDropped += result.floating.length;

    setMessage(
      result.matched
        ? `✨ +${calculateShotScore(result, Math.max(g.combo, 1))} POINTS!`
        : "Keep trying!"
    );

    sync();

    // Unlock after the travel animation.
    window.setTimeout(() => {
      if (gameRef.current === g) {
        g.flyingBubble = null;
        shotLockRef.current = false;
        sync();
      }
    }, 235);

    checkObjective();
  }, [
    checkObjective,
    sync,
    startMusic,
    playShootSound,
    playPopSound,
  ]);

  // BOOSTERS

  const toggleBooster = useCallback((type) => {
    const g = gameRef.current;

    if (
      !g ||
      g.status !== "READY" ||
      g.paused ||
      shotLockRef.current
    ) return;

    if (g.armed === type) {
      g.armed = null;
    } else if (g.boosters[type] > 0) {
      g.armed = type;
    }

    sync();
  }, [sync]);

  const swap = useCallback(() => {
    const g = gameRef.current;

    if (
      !g ||
      g.status !== "READY" ||
      g.paused ||
      g.armed ||
      shotLockRef.current
    ) return;

    [g.current, g.next] = [g.next, g.current];
    g.swappedSinceShot = !g.swappedSinceShot;

    sync();
  }, [sync]);

  // RESTART

  const restart = useCallback(() => {
    stopMusic();

    shotLockRef.current = false;
    pointerDownRef.current = false;

    if (onRestart) {
      finishReportedRef.current = false;
      onRestart();
      return;
    }

    gameRef.current = createGame(actualLevel, seed);
    finishReportedRef.current = false;

    setPaused(false);
    setMessage("");
    sync();
  }, [actualLevel, onRestart, seed, sync, stopMusic]);

  // PAUSE

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.status !== "READY") return;

    g.paused = !g.paused;
    setPaused(g.paused);

    if (g.paused) {
      stopMusic();
    }

    draw();
  }, [draw, stopMusic]);

  // HINT

  const hint = useCallback(() => {
    if (hintCount <= 0) return;

    setHintCount((n) => n - 1);
    setMessage("💡 Aim carefully at matching bubbles!");
  }, [hintCount]);

  // INITIALIZE

  useEffect(() => {
    if (!actualLevel.layout?.length || seed == null) return;

    gameRef.current = createGame(actualLevel, seed);
    finishReportedRef.current = false;

    shotLockRef.current = false;
    pointerDownRef.current = false;

    setPaused(false);
    setMessage("");

    sync();

    return () => {
      gameRef.current = null;
      shotLockRef.current = false;
    };
  }, [actualLevel, seed, sync]);

  // ANIMATION LOOP

  useEffect(() => {
    const animate = () => {
      if (gameRef.current) {
        draw();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  // BEST SCORE

  useEffect(() => {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
    } catch {}
  }, [bestScore]);

  // SOUND

  useEffect(() => {
    if (!sound) stopMusic();
  }, [sound, stopMusic]);

  useEffect(() => {
    return () => {
      stopMusic();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopMusic]);

  // KEYBOARD

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) return;

      if (event.key === "Escape") togglePause();
      if (event.key.toLowerCase() === "s") swap();
      if (event.key.toLowerCase() === "h") hint();

      if (event.key === " " && event.target.tagName !== "BUTTON") {
        event.preventDefault();
        shoot();
      }

      if (event.key === "1") toggleBooster("bomb");
      if (event.key === "2") toggleBooster("rainbow");
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hint, shoot, swap, toggleBooster, togglePause]);

  // UI

  const stars = calculateStars(
    hud?.score ?? 0,
    starThresholds
  );

  const boosters = [
    { id: "bomb", icon: "💣", label: "Bomb", key: "1" },
    { id: "rainbow", icon: "🌈", label: "Rainbow", key: "2" },
  ];

  const g = gameRef.current;

  return (
    <div style={{
      width: W,
      maxWidth: "100%",
      margin: "0 auto",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <style>{`
        .bs-btn {
          border: 1px solid rgba(125,211,252,.25);
          background: #172554;
          color: #fff;
          border-radius: 9px;
          padding: 8px 10px;
          font-weight: 800;
          cursor: pointer;
        }
        .bs-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: 9,
        background: "#111827",
        borderRadius: 12,
        marginBottom: 8,
        fontSize: 12,
      }}>
        <button className="bs-btn" onClick={onLevelsClick || onExit}>
          ☰ Levels
        </button>

        <strong style={{ color: "#7dd3fc" }}>
          LEVEL {actualLevel.id}
        </strong>

        <strong>⭐ {hud?.score ?? 0}</strong>

        <button className="bs-btn" onClick={togglePause}>
          Ⅱ
        </button>

        <button className="bs-btn" onClick={() => setSettings(true)}>
          ⚙️
        </button>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#cbd5e1",
        margin: "0 4px 7px",
      }}>
        <span>🎯 {hud?.shots ?? actualLevel.shots} shots</span>
        <span>🏆 Best: {bestScore}</span>
        <span>🔥 Combo x{hud?.combo ?? 0}</span>
      </div>

      <div style={{
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
        border: "2px solid rgba(56,189,248,.35)",
        background: "radial-gradient(circle at 50% 35%,#1e3a5f,#071326 75%)",
        boxShadow: "0 15px 35px #0009",
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={aim}
          onPointerDown={(event) => {
            pointerDownRef.current = true;
            aim(event);

            if (event.currentTarget.setPointerCapture) {
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerUp={(event) => {
            if (!pointerDownRef.current) return;

            pointerDownRef.current = false;
            aim(event);
            shoot();
          }}
          onPointerCancel={() => {
            pointerDownRef.current = false;
          }}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            touchAction: "none",
            cursor: "crosshair",
          }}
        />

        <div style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          padding: "6px 9px",
          background: "#0f172add",
          border: "1px solid #38bdf866",
          borderRadius: 10,
          textAlign: "center",
          pointerEvents: "none",
        }}>
          <small style={{
            display: "block",
            color: "#94a3b8",
            fontSize: 9,
          }}>
            NEXT
          </small>

          <span style={{
            display: "inline-block",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: COLOR_MAP[hud?.next || g?.next] || "#fff",
          }} />
        </div>

        {message && !hud?.outcome && (
          <div style={{
            position: "absolute",
            top: "42%",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#fde68a",
            fontSize: 20,
            fontWeight: 900,
            pointerEvents: "none",
          }}>
            {message}
          </div>
        )}

        {paused && !hud?.outcome && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "#020617df",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}>
            <h2>⏸ PAUSED</h2>
            <button className="bs-btn" onClick={togglePause}>▶ Resume</button>
            <button className="bs-btn" onClick={restart}>↻ Restart</button>
          </div>
        )}

        {hud?.outcome && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "#020617ed",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
            padding: 14,
          }}>
            <div style={{ fontSize: 52 }}>
              {hud.outcome === "WON" ? "🏆" : "💔"}
            </div>

            <h2 style={{
              margin: 0,
              color: hud.outcome === "WON" ? "#34d399" : "#fb7185",
            }}>
              {hud.outcome === "WON" ? "LEVEL CLEARED!" : "GAME OVER"}
            </h2>

            {hud.outcome === "WON" && (
              <>
                <div style={{ fontSize: 34, color: "#fbbf24" }}>
                  {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                </div>
                <strong>{stars} / 3 STARS</strong>
              </>
            )}

            <strong style={{ fontSize: 19 }}>
              Score: {hud.score}
            </strong>

            {hud.outcome === "WON" && (
              <div style={{
                width: "100%",
                maxWidth: 260,
                padding: 9,
                borderRadius: 9,
                background: "#1e293b",
                fontSize: 12,
                color: saveStatus.state === "error"
                  ? "#fca5a5"
                  : saveStatus.state === "saved"
                  ? "#86efac"
                  : "#bfdbfe",
              }}>
                {saveStatus.state === "saving" && "⏳ Saving your progress..."}
                {saveStatus.state === "saved" && "✓ Progress saved successfully!"}
                {saveStatus.state === "idle" && "Preparing your progress..."}
                {saveStatus.state === "error" && (
                  <>
                    <div>{saveStatus.message || "Could not save progress."}</div>
                    {saveStatus.canRetry && (
                      <button className="bs-btn" onClick={onRetrySave}>
                        ↻ Retry Save
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {hud.outcome === "WON" ? (
              <button
                className="bs-btn"
                disabled={saveStatus.state !== "saved"}
                onClick={onNext}
              >
                Next Level ➜
              </button>
            ) : (
              <button className="bs-btn" onClick={restart}>
                ↻ Try Again
              </button>
            )}

            <button className="bs-btn" onClick={onLevelsClick || onExit}>
              ☰ Back to Levels
            </button>
          </div>
        )}

        {settings && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "#020617ed",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}>
            <h2>⚙️ SETTINGS</h2>

            <button className="bs-btn" onClick={() => setSound((v) => !v)}>
              {sound ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>

            <button className="bs-btn" onClick={() => setSettings(false)}>
              Done
            </button>
          </div>
        )}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: 7,
        padding: 10,
        marginTop: 9,
        background: "#111827",
        borderRadius: 14,
      }}>
        {boosters.map((booster) => {
          const count = hud?.boosters?.[booster.id] ?? 0;
          const active = hud?.armed === booster.id;

          return (
            <button
              key={booster.id}
              className="bs-btn"
              onClick={() => toggleBooster(booster.id)}
              disabled={!count}
              style={{
                minWidth: 75,
                background: active ? "#9f1239" : "#172554",
              }}
            >
              <span style={{ display: "block", fontSize: 20 }}>
                {booster.icon}
              </span>
              <span style={{ display: "block", fontSize: 10 }}>
                {booster.label} ×{count}
              </span>
              <span style={{ display: "block", fontSize: 9 }}>
                Key {booster.key}
              </span>
            </button>
          );
        })}

        <button className="bs-btn" onClick={swap}>🔄 Swap</button>
        <button className="bs-btn" onClick={hint}>💡 Hint ×{hintCount}</button>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        color: "#94a3b8",
        fontSize: 10,
      }}>
        <span>Drag to aim • Release to shoot</span>
        <span>Space: Shoot • Esc: Pause</span>
      </div>
    </div>
  );
}
