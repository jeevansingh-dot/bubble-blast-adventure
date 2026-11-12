
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

import GameBoard3D from "./GameBoard3D.jsx";

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

// =====================================
// PREMIUM GLASS BUBBLE
// =====================================

function drawBubble(ctx, x, y, color, radius = R) {
  if (!color) return;

  const fill = COLOR_MAP[color] || color;

  ctx.save();

  ctx.shadowColor = fill;
  ctx.shadowBlur = 18;

  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    1,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.22, fill);
  gradient.addColorStop(0.78, fill);
  gradient.addColorStop(1, "#10152d");

  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(255,255,255,.65)";
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(
    x - radius * 0.28,
    y - radius * 0.35,
    radius * 0.25,
    radius * 0.13,
    -0.5,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x + radius * 0.35,
    y + radius * 0.25,
    Math.max(1.5, radius * 0.08),
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.fill();

  ctx.restore();
}

// =====================================
// GAME CREATION
// =====================================

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
    boosters: {
      bomb: 2,
      rainbow: 2,
    },
    armed: null,
    status: "READY",
    level,
    effects: [],
    flyingBubble: null,
    paused: false,
  };
}

// =====================================
// MAIN GAME COMPONENT
// =====================================

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
  const actualLevel = useMemo(
    () =>
      level || {
        id: levelId,
        layout: [],
        shots: 20,
        objective: {
          type: "clear_all",
        },
        starThresholds: [200, 400, 600],
      },
    [level, levelId]
  );

  const starThresholds = useMemo(
    () => actualLevel.starThresholds || [200, 400, 600],
    [actualLevel.starThresholds]
  );

  // WORLD THEME

  const currentLevelId = Number(actualLevel.id || levelId || 1);

  const worldBackground =
    currentLevelId <= 5
      ? "#06251f"
      : currentLevelId <= 10
      ? "#031d3b"
      : currentLevelId <= 20
      ? "#171044"
      : currentLevelId <= 30
      ? "#10283d"
      : currentLevelId <= 35
      ? "#310d12"
      : "#160b35";

  const worldGlow =
    currentLevelId <= 5
      ? "#10b981"
      : currentLevelId <= 10
      ? "#0284c7"
      : currentLevelId <= 20
      ? "#6366f1"
      : currentLevelId <= 30
      ? "#0891b2"
      : currentLevelId <= 35
      ? "#ea580c"
      : "#9333ea";

  const worldName =
    currentLevelId <= 5
      ? "MAGICAL GARDEN"
      : currentLevelId <= 10
      ? "UNDERWATER OCEAN"
      : currentLevelId <= 20
      ? "FANTASY VALLEY"
      : currentLevelId <= 30
      ? "ICY PEAKS"
      : currentLevelId <= 35
      ? "LAVA VOLCANO"
      : "COSMIC GALAXY";

  // REFS

  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  const finishReportedRef = useRef(false);
  const animationRef = useRef(null);

  const shotLockRef = useRef(false);
  const pointerDownRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const pointerCancelledRef = useRef(false);

  const audioContextRef = useRef(null);
  const musicTimerRef = useRef(null);
  const musicStepRef = useRef(0);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // STATE

  const [hud, setHud] = useState(null);

  const [sceneState, setSceneState] = useState({
    board: [],
    current: null,
    angle: Math.PI / 2,
    effects: [],
  });

  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(false);
  const [sound, setSound] = useState(true);
  const [hintCount, setHintCount] = useState(3);

  const [showWorldTransition, setShowWorldTransition] = useState(true);
  const [transitionVisible, setTransitionVisible] = useState(true);

  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  // =====================================
  // AUDIO
  // =====================================

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

    window.setTimeout(() => {
      playTone(950, 0.12, "sine", 0.05);
    }, 65);
  }, [playTone]);

  const startMusic = useCallback(() => {
    if (!sound || musicTimerRef.current) return;

    const notes = [
      523.25,
      659.25,
      783.99,
      659.25,
      587.33,
      698.46,
      880,
      698.46,
    ];

    getAudioContext();

    musicTimerRef.current = window.setInterval(() => {
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
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  // =====================================
  // DRAW
  // =====================================

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const g = gameRef.current;

    if (!canvas || !g) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    const now = performance.now();

    // Background particles

    for (let i = 0; i < 30; i++) {
      const x = (i * 83 + 19) % W;
      const y = (i * 47 + 13) % H;

      const alpha =
        0.18 + Math.sin(now * 0.0015 + i) * 0.12;

      ctx.fillStyle = `rgba(255,255,255,${alpha})`;

      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // AIM TRAJECTORY

    if (g.status === "READY" && !g.paused) {
      const trajectory = traceShot(
        g.board,
        LAUNCHER_X,
        LAUNCHER_Y,
        g.angle
      );

      if (trajectory?.path?.length > 1) {
        const points = trajectory.path;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });

        ctx.strokeStyle = "rgba(56,189,248,.22)";
        ctx.lineWidth = 7;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 15;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });

        ctx.strokeStyle = "rgba(255,255,255,.85)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 8]);
        ctx.lineDashOffset = -(now * 0.025);
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.setLineDash([]);

        const target = points[points.length - 1];

        ctx.beginPath();
        ctx.arc(
          target.x,
          target.y,
          5 + Math.sin(now * 0.008) * 1.5,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }
    }

    // FLYING BUBBLE - REAL WALL BOUNCE ANIMATION

    if (g.flyingBubble) {
      const b = g.flyingBubble;

      const progress = clamp(
        (now - b.start) / b.duration,
        0,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      const points =
        b.path && b.path.length > 1
          ? b.path
          : [
              { x: b.startX, y: b.startY },
              { x: b.endX, y: b.endY },
            ];

      // Calculate total path distance

      let totalDistance = 0;
      const segmentLengths = [];

      for (let i = 1; i < points.length; i++) {
        const distance = Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y
        );

        segmentLengths.push(distance);
        totalDistance += distance;
      }

      // Current position along the complete path

      let remainingDistance = totalDistance * eased;

      let currentX = points[0].x;
      let currentY = points[0].y;

      const trailPoints = [{ x: currentX, y: currentY }];

      for (let i = 0; i < segmentLengths.length; i++) {
        const segmentLength = segmentLengths[i];

        const from = points[i];
        const to = points[i + 1];

        if (remainingDistance >= segmentLength) {
          currentX = to.x;
          currentY = to.y;

          trailPoints.push({
            x: currentX,
            y: currentY,
          });

          remainingDistance -= segmentLength;
        } else {
          const t =
            segmentLength > 0
              ? remainingDistance / segmentLength
              : 0;

          currentX = from.x + (to.x - from.x) * t;
          currentY = from.y + (to.y - from.y) * t;

          trailPoints.push({
            x: currentX,
            y: currentY,
          });

          break;
        }
      }

      const fill = COLOR_MAP[b.color] || b.color;

      const trailGradient = ctx.createLinearGradient(
        b.startX,
        b.startY,
        currentX,
        currentY
      );

      trailGradient.addColorStop(0, "rgba(255,255,255,0)");
      trailGradient.addColorStop(0.65, `${fill}33`);
      trailGradient.addColorStop(1, `${fill}cc`);

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(trailPoints[0].x, trailPoints[0].y);

      trailPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = R * 0.85;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = fill;
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Small particles

      for (let i = 1; i <= 5; i++) {
        const t = i / 6;

        const particleX =
          b.startX + (currentX - b.startX) * t;

        const particleY =
          b.startY + (currentY - b.startY) * t;

        ctx.beginPath();

        ctx.arc(
          particleX,
          particleY,
          Math.max(1, 3 * (1 - t)),
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `${fill}99`;
        ctx.fill();
      }

      ctx.restore();

      const pulse =
        1 + Math.sin(progress * Math.PI) * 0.12;

      drawBubble(
        ctx,
        currentX,
        currentY,
        b.color,
        R * pulse
      );
    }

    // REMOVED BUBBLE EFFECTS

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

    // DANGER LINE

    ctx.beginPath();
    ctx.moveTo(0, H - 115);
    ctx.lineTo(W, H - 115);

    ctx.strokeStyle = "rgba(248,113,113,.5)";
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // =====================================
  // SYNC GAME STATE
  // =====================================

  const sync = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;

    setHud({
      score: g.score,
      shots: g.shots,
      remaining: countBubbles(g.board),
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

    setSceneState({
      board: g.board.map((row) =>
        row.map((bubble) =>
          bubble ? { ...bubble } : null
        )
      ),
      current: g.armed || g.current,
      angle: g.angle,
      effects: g.effects.map((effect, index) => ({
        ...effect,
        id: `${effect.start}-${index}`,
      })),
    });

    draw();
  }, [draw, starThresholds]);

  // =====================================
  // FINISH GAME
  // =====================================

  const finishGame = useCallback(
    (outcome) => {
      const g = gameRef.current;

      if (!g || g.status !== "READY") return;

      g.status = outcome;
      g.flyingBubble = null;

      shotLockRef.current = false;
      pointerDownRef.current = false;
      activePointerIdRef.current = null;
      pointerCancelledRef.current = false;

      setPaused(false);
      stopMusic();

      if (outcome === "WON") {
        playTone(783.99, 0.2, "sine", 0.08);

        window.setTimeout(() => {
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

  // =====================================
  // CHECK OBJECTIVE
  // =====================================

  const checkObjective = useCallback(() => {
    const g = gameRef.current;

    if (!g || g.status !== "READY") return;

    const remaining = countBubbles(g.board);

    if (remaining === 0) {
      finishGame("WON");
      return;
    }

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

  // =====================================
  // AIM
  // =====================================

  const aim = useCallback(
    (event) => {
      const g = gameRef.current;
      const canvas = canvasRef.current;

      if (
        !g ||
        !canvas ||
        g.status !== "READY" ||
        g.paused ||
        shotLockRef.current
      ) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x =
        ((event.clientX - rect.left) / rect.width) * W;

      const y =
        ((event.clientY - rect.top) / rect.height) * H;

      const angle = Math.atan2(
        LAUNCHER_Y - y,
        x - LAUNCHER_X
      );

      g.angle = clamp(angle, MIN_ANGLE, MAX_ANGLE);

      setSceneState((prev) => ({
        ...prev,
        angle: g.angle,
      }));

      draw();
    },
    [draw]
  );

  // =====================================
  // SHOOT
  // =====================================

  const shoot = useCallback(() => {
    const g = gameRef.current;

    if (
      !g ||
      g.status !== "READY" ||
      g.paused ||
      shotLockRef.current ||
      g.shots <= 0
    ) {
      return;
    }

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

    if (!simulation?.cell) return;

    const { r, c } = simulation.cell;
    const target = cellToPixel(r, c);

    shotLockRef.current = true;

    if (special) {
      g.boosters[special]--;
      g.armed = null;
    } else {
      g.current = g.next;
      g.next = pickColor(g.board, g.rng);
    }

    // IMPORTANT: Store complete trajectory path.
    // Actual bubble will now follow every wall bounce.

    g.flyingBubble = {
      startX: LAUNCHER_X,
      startY: LAUNCHER_Y,
      endX: target.x,
      endY: target.y,
      path: [
        ...simulation.path,
        target,
      ],
      color,
      start: performance.now(),
      duration: 230,
    };

    startMusic();
    playShootSound();

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
      row.map((bubble) => (bubble ? { ...bubble } : null))
    );

    const result = resolveShot(g.board, r, c, color);

    let removedCount = 0;

    previousBoard.forEach((row, rowIndex) => {
      row.forEach((bubble, colIndex) => {
        if (
          !bubble ||
          g.board[rowIndex]?.[colIndex]
        ) {
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
        ? `✨ +${calculateShotScore(
            result,
            Math.max(g.combo, 1)
          )} POINTS!`
        : "Keep trying!"
    );

    sync();

    window.setTimeout(() => {
      if (gameRef.current === g) {
        g.flyingBubble = null;
        shotLockRef.current = false;

        sync();
        checkObjective();
      }
    }, 235);

    window.setTimeout(() => {
      if (gameRef.current === g) {
        sync();
      }
    }, 800);
  }, [
    checkObjective,
    sync,
    startMusic,
    playShootSound,
    playPopSound,
  ]);

  // =====================================
  // MOBILE + DESKTOP POINTER CONTROLS
  // =====================================

  const isInsideCanvas = useCallback((event) => {
    const canvas = canvasRef.current;

    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();

    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }, []);

  const resetPointer = useCallback(() => {
    const canvas = canvasRef.current;
    const pointerId = activePointerIdRef.current;

    pointerDownRef.current = false;
    activePointerIdRef.current = null;
    pointerCancelledRef.current = false;

    try {
      if (
        canvas &&
        pointerId !== null &&
        canvas.hasPointerCapture(pointerId)
      ) {
        canvas.releasePointerCapture(pointerId);
      }
    } catch {}
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.isPrimary === false) return;

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      const g = gameRef.current;

      if (
        !g ||
        g.status !== "READY" ||
        g.paused ||
        shotLockRef.current
      ) {
        return;
      }

      if (activePointerIdRef.current !== null) {
        return;
      }

      event.preventDefault();

      activePointerIdRef.current = event.pointerId;
      pointerDownRef.current = true;
      pointerCancelledRef.current = false;

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}

      aim(event);
    },
    [aim]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const isTouch =
        event.pointerType === "touch" ||
        event.pointerType === "pen";

      if (isTouch) {
        if (
          !pointerDownRef.current ||
          activePointerIdRef.current !== event.pointerId
        ) {
          return;
        }

        if (!isInsideCanvas(event)) {
          pointerCancelledRef.current = true;
          return;
        }

        if (pointerCancelledRef.current) return;

        aim(event);
        return;
      }

      // Desktop mouse hover aiming.

      if (pointerDownRef.current) {
        if (activePointerIdRef.current !== event.pointerId) {
          return;
        }

        if (!isInsideCanvas(event)) {
          pointerCancelledRef.current = true;
          return;
        }

        if (pointerCancelledRef.current) return;
      }

      aim(event);
    },
    [aim, isInsideCanvas]
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (
        !pointerDownRef.current ||
        activePointerIdRef.current !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();

      const shouldShoot =
        !pointerCancelledRef.current &&
        isInsideCanvas(event);

      if (shouldShoot) {
        aim(event);
      }

      resetPointer();

      if (shouldShoot) {
        shoot();
      }
    },
    [aim, shoot, isInsideCanvas, resetPointer]
  );

  const handlePointerCancel = useCallback(
    (event) => {
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      resetPointer();
    },
    [resetPointer]
  );

  // =====================================
  // BOOSTERS
  // =====================================

  const toggleBooster = useCallback(
    (type) => {
      const g = gameRef.current;

      if (
        !g ||
        g.status !== "READY" ||
        g.paused ||
        shotLockRef.current
      ) {
        return;
      }

      if (g.armed === type) {
        g.armed = null;
      } else if (g.boosters[type] > 0) {
        g.armed = type;
      }

      sync();
    },
    [sync]
  );

  // =====================================
  // SWAP
  // =====================================

  const swap = useCallback(() => {
    const g = gameRef.current;

    if (
      !g ||
      g.status !== "READY" ||
      g.paused ||
      g.armed ||
      shotLockRef.current
    ) {
      return;
    }

    [g.current, g.next] = [g.next, g.current];

    g.swappedSinceShot = !g.swappedSinceShot;

    sync();
  }, [sync]);

  // =====================================
  // RESTART
  // =====================================

  const restart = useCallback(() => {
    stopMusic();

    shotLockRef.current = false;
    pointerDownRef.current = false;
    activePointerIdRef.current = null;
    pointerCancelledRef.current = false;

    if (onRestart) {
      finishReportedRef.current = false;
      onRestart();
      return;
    }

    gameRef.current = createGame(
      actualLevel,
      seed ?? Date.now()
    );

    finishReportedRef.current = false;

    setPaused(false);
    setMessage("");

    sync();
  }, [actualLevel, onRestart, seed, sync, stopMusic]);

  // =====================================
  // PAUSE
  // =====================================

  const togglePause = useCallback(() => {
    const g = gameRef.current;

    if (!g || g.status !== "READY") return;

    g.paused = !g.paused;

    setPaused(g.paused);

    if (g.paused) {
      stopMusic();

      pointerDownRef.current = false;
      activePointerIdRef.current = null;
      pointerCancelledRef.current = false;
    }

    draw();
  }, [draw, stopMusic]);

  // =====================================
  // HINT
  // =====================================

  const hint = useCallback(() => {
    if (hintCount <= 0) return;

    setHintCount((n) => n - 1);

    setMessage(
      "💡 Aim at bubbles matching your current colour!"
    );
  }, [hintCount]);

  // =====================================
  // INITIALIZE
  // =====================================

  useEffect(() => {
    if (!actualLevel.layout?.length) {
      console.error(
        "Game level layout is empty. Check the level data passed to GameCanvas.",
        actualLevel
      );

      gameRef.current = null;
      setHud(null);

      setSceneState({
        board: [],
        current: null,
        angle: Math.PI / 2,
        effects: [],
      });

      return;
    }

    gameRef.current = createGame(
      actualLevel,
      seed ?? Date.now()
    );

    finishReportedRef.current = false;
    shotLockRef.current = false;
    pointerDownRef.current = false;
    activePointerIdRef.current = null;
    pointerCancelledRef.current = false;

    setPaused(false);
    setMessage("");

    sync();

    return () => {
      gameRef.current = null;
      shotLockRef.current = false;
      pointerDownRef.current = false;
      activePointerIdRef.current = null;
      pointerCancelledRef.current = false;
    };
  }, [actualLevel, seed, sync]);

  // =====================================
  // CINEMATIC WORLD TRANSITION
  // =====================================

  useEffect(() => {
    setShowWorldTransition(true);
    setTransitionVisible(true);

    const hideTimer = window.setTimeout(() => {
      setTransitionVisible(false);
    }, 2200);

    const removeTimer = window.setTimeout(() => {
      setShowWorldTransition(false);
    }, 2800);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [currentLevelId]);

  // =====================================
  // ANIMATION LOOP
  // =====================================

  useEffect(() => {
    const animate = () => {
      if (gameRef.current) {
        draw();
      }

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  // =====================================
  // BEST SCORE
  // =====================================

  useEffect(() => {
    try {
      localStorage.setItem(
        BEST_SCORE_KEY,
        String(bestScore)
      );
    } catch {}
  }, [bestScore]);

  // =====================================
  // SOUND
  // =====================================

  useEffect(() => {
    if (!sound) {
      stopMusic();
    }
  }, [sound, stopMusic]);

  // =====================================
  // CLEANUP
  // =====================================

  useEffect(() => {
    return () => {
      stopMusic();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopMusic]);

  // =====================================
  // KEYBOARD
  // =====================================

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) return;

      if (event.key === "Escape") {
        togglePause();
      }

      if (event.key.toLowerCase() === "s") {
        swap();
      }

      if (event.key.toLowerCase() === "h") {
        hint();
      }

      if (
        event.code === "Space" &&
        event.target.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        shoot();
      }

      if (event.key === "1") {
        toggleBooster("bomb");
      }

      if (event.key === "2") {
        toggleBooster("rainbow");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    hint,
    shoot,
    swap,
    toggleBooster,
    togglePause,
  ]);

  // =====================================
  // HUD DATA
  // =====================================

  const stars = calculateStars(
    hud?.score ?? 0,
    starThresholds
  );

  const boosters = [
    {
      id: "bomb",
      icon: "💣",
      label: "Bomb",
      key: "1",
    },
    {
      id: "rainbow",
      icon: "🌈",
      label: "Rainbow",
      key: "2",
    },
  ];

  const g = gameRef.current;

  // =====================================
  // RENDER
  // =====================================

  return (
    <div
      className="bs-game-shell"
      style={{
        width: "100%",
        maxWidth: W,
        margin: "0 auto",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .bs-game-shell {
          padding: 12px;
          border: 1px solid rgba(129,140,248,.22);
          border-radius: 22px;
          background:
            radial-gradient(circle at 10% 10%, rgba(59,130,246,.10), transparent 35%),
            radial-gradient(circle at 90% 90%, rgba(147,51,234,.12), transparent 35%),
            rgba(8,13,35,.82);
          box-shadow:
            0 20px 60px rgba(0,0,0,.35),
            inset 0 1px rgba(255,255,255,.06);
        }

        .bs-btn {
          border: 1px solid rgba(125,211,252,.3);
          background: linear-gradient(135deg,#263b76,#172554);
          color: #fff;
          border-radius: 11px;
          padding: 9px 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all .22s ease;
          box-shadow:
            0 5px 14px rgba(0,0,0,.25),
            inset 0 1px rgba(255,255,255,.12);
          touch-action: manipulation;
        }

        .bs-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#2563eb,#6d28d9);
          border-color: #93c5fd;
          box-shadow:
            0 0 18px rgba(59,130,246,.4),
            0 8px 20px rgba(0,0,0,.3);
          transform: translateY(-3px) scale(1.02);
        }

        .bs-btn:active:not(:disabled) {
          transform: scale(.96);
        }

        .bs-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .bs-game-shell button:focus-visible {
          outline: 2px solid #7dd3fc;
          outline-offset: 3px;
        }

        .bs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          margin-bottom: 12px;
          padding: 11px;
          position: relative;
          z-index: 5;
          border: 1px solid rgba(129,140,248,.22);
          border-radius: 15px;
          background: linear-gradient(110deg,rgba(30,41,80,.92),rgba(17,24,55,.92));
          box-shadow: 0 8px 25px rgba(0,0,0,.22);
          backdrop-filter: blur(14px);
          box-sizing: border-box;
        }

        .bs-topbar strong {
          font-size: 13px;
          letter-spacing: .5px;
          text-shadow: 0 0 12px rgba(96,165,250,.3);
        }

        .bs-game-stage {
          position: relative;
          width: 100%;
          aspect-ratio: ${W} / ${H};
          overflow: hidden;
          border-radius: 20px;
          background:
            radial-gradient(circle at 50% 35%, ${worldGlow}55, transparent 55%),
            ${worldBackground};
          border: 1px solid ${worldGlow}88;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.025),
            0 18px 45px rgba(0,0,0,.4),
            0 0 30px ${worldGlow}33;
          touch-action: none;
          overscroll-behavior: contain;
          isolation: isolate;
          transition: background .5s ease, box-shadow .5s ease;
        }

        .bs-game-stage::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          border-radius: inherit;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,.045),
            transparent 20%,
            transparent 80%,
            rgba(99,102,241,.07)
          );
        }

        .bs-world-label {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 4;
          color: #ffffffbb;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 4px;
          pointer-events: none;
          text-shadow: 0 0 10px rgba(255,255,255,.5), 0 0 22px ${worldGlow};
          white-space: nowrap;
        }

        .bs-game-stage canvas {
          display: block;
        }

        .bs-touch-hint {
          display: none;
        }

        /* WORLD TRANSITION */

        .bs-world-transition {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(circle at center, ${worldGlow}88, ${worldBackground} 75%);
          transition: opacity .6s ease, transform .6s ease;
          pointer-events: none;
        }

        .bs-world-transition.hide {
          opacity: 0;
          transform: scale(1.12);
        }

        .bs-transition-ring {
          position: absolute;
          width: 180px;
          height: 180px;
          border: 2px solid ${worldGlow};
          border-radius: 50%;
          box-shadow: 0 0 20px ${worldGlow}, inset 0 0 25px ${worldGlow};
          animation: bs-ring-reveal 2.2s ease-out forwards;
        }

        .bs-transition-ring.second {
          width: 260px;
          height: 260px;
          animation-delay: .15s;
          opacity: .5;
        }

        .bs-transition-content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: bs-title-reveal .8s ease both;
          padding: 10px;
        }

        .bs-transition-world {
          color: ${worldGlow};
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 5px;
          margin-bottom: 12px;
        }

        .bs-transition-title {
          color: white;
          font-size: clamp(30px,7vw,52px);
          font-weight: 1000;
          letter-spacing: 3px;
          text-shadow: 0 0 15px ${worldGlow}, 0 0 35px ${worldGlow};
        }

        .bs-transition-level {
          margin-top: 12px;
          color: #ffffffcc;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 4px;
        }

        .bs-transition-line {
          width: 100px;
          height: 3px;
          margin: 20px auto 0;
          border-radius: 10px;
          background: ${worldGlow};
          box-shadow: 0 0 15px ${worldGlow};
          animation: bs-line-expand 1s ease both;
        }

        @keyframes bs-ring-reveal {
          from {
            transform: scale(.2) rotate(0deg);
            opacity: 0;
          }
          45% { opacity: .8; }
          to {
            transform: scale(2.1) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes bs-title-reveal {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.8);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes bs-line-expand {
          from { width: 0; }
          to { width: 100px; }
        }

        /* BOOSTER PANEL */

        .bs-controls {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 10px;
          padding: 12px;
          margin-top: 10px;
          border: 1px solid rgba(129,140,248,.22);
          border-radius: 17px;
          background: linear-gradient(135deg,rgba(24,34,73,.96),rgba(12,18,43,.96));
          box-shadow: 0 12px 30px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.06);
          box-sizing: border-box;
          touch-action: manipulation;
        }

        .bs-controls button {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .bs-controls .bs-btn {
          min-width: 0;
          min-height: 65px;
          padding: 9px 5px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          background: linear-gradient(145deg,#26376b,#111b42);
        }

        .bs-controls .bs-btn:hover:not(:disabled) {
          background: linear-gradient(145deg,#4338ca,#1d4ed8);
        }

        /* GAME INFO */

        .bs-game-info {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 9px;
          padding: 10px 12px;
          border: 1px solid rgba(129,140,248,.16);
          border-radius: 12px;
          background: rgba(15,23,52,.75);
          color: #cbd5e1;
          box-sizing: border-box;
        }

        .bs-game-info span {
          font-size: 10px;
          font-weight: 700;
        }

        /* MOBILE RESPONSIVE */

        @media (max-width: 600px) {
          .bs-game-shell {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            padding: 6px !important;
            margin: 0 auto !important;
            border-radius: 14px !important;
            box-sizing: border-box !important;
            overflow: hidden;
          }

          .bs-topbar {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
            width: 100%;
            padding: 7px;
            margin-bottom: 7px;
            box-sizing: border-box;
          }

          .bs-topbar > * {
            min-width: 0;
            text-align: center;
          }

          .bs-topbar strong {
            font-size: 10px;
            letter-spacing: 0;
          }

          .bs-topbar .bs-btn {
            min-height: 38px;
            padding: 6px 3px;
            font-size: 11px;
            border-radius: 9px;
          }

          .bs-game-stage {
            width: 100% !important;
            height: min(72svh, 540px) !important;
            min-height: 340px;
            max-height: 540px;
            aspect-ratio: auto !important;
            border-radius: 12px;
            overflow: hidden;
            touch-action: none;
            overscroll-behavior: contain;
            user-select: none;
            -webkit-user-select: none;
          }

          .bs-game-stage canvas {
            display: block;
            width: 100% !important;
            height: 100% !important;
            touch-action: none !important;
            user-select: none;
            -webkit-user-select: none;
          }

          .bs-world-label {
            top: 8px;
            font-size: 8px;
            letter-spacing: 2px;
          }

          .bs-touch-hint {
            display: block;
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 4;
            max-width: calc(100% - 100px);
            white-space: nowrap;
            text-align: center;
            pointer-events: none;
            padding: 6px 9px;
            border-radius: 20px;
            background: rgba(15,23,42,.82);
            border: 1px solid rgba(125,211,252,.3);
            color: #bae6fd;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: .5px;
          }

          .bs-controls {
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
            padding: 7px;
            margin-top: 7px;
            box-sizing: border-box;
          }

          .bs-controls .bs-btn {
            min-width: 0;
            min-height: 56px;
            padding: 6px 3px;
            border-radius: 10px;
            touch-action: manipulation;
          }

          .bs-controls .bs-btn:active {
            transform: scale(.94);
          }

          .bs-game-info {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            justify-content: center;
            text-align: center;
            gap: 8px;
            padding: 9px 5px;
            margin-top: 7px;
            box-sizing: border-box;
          }

          .bs-game-info span {
            font-size: 9px;
            overflow-wrap: anywhere;
          }

          .bs-transition-title {
            font-size: clamp(20px, 6vw, 32px);
          }

          .bs-transition-world {
            font-size: 9px;
            letter-spacing: 3px;
          }

          .bs-transition-level {
            font-size: 12px;
          }

          .bs-transition-ring {
            width: 120px;
            height: 120px;
          }

          .bs-transition-ring.second {
            width: 180px;
            height: 180px;
          }
        }

        /* SMALL PHONES */

        @media (max-width: 380px) {
          .bs-game-stage {
            height: min(68svh, 470px) !important;
            min-height: 320px;
          }

          .bs-topbar {
            gap: 4px;
            padding: 5px;
          }

          .bs-topbar .bs-btn {
            min-height: 35px;
            font-size: 10px;
            padding: 5px 2px;
          }

          .bs-controls {
            gap: 5px;
            padding: 5px;
          }

          .bs-controls .bs-btn {
            min-height: 50px;
          }

          .bs-game-info span {
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bs-game-shell *,
          .bs-game-shell *::before,
          .bs-game-shell *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* TOP BAR */}

      <div className="bs-topbar">
        <button
          className="bs-btn"
          onClick={onLevelsClick || onExit}
        >
          ☰ Levels
        </button>

        <strong style={{ color: "#7dd3fc" }}>
          LEVEL {actualLevel.id}
        </strong>

        <strong>⭐ {hud?.score ?? 0}</strong>

        <strong style={{ color: "#67e8f9" }}>
          🫧 {hud?.remaining ?? 0} Left
        </strong>

        <button className="bs-btn" onClick={togglePause}>
          Ⅱ
        </button>

        <button
          className="bs-btn"
          onClick={() => setSettings(true)}
        >
          ⚙️
        </button>
      </div>

      {/* GAME STAGE */}

      <div className="bs-game-stage">
        {showWorldTransition && (
          <div
            className={`bs-world-transition ${
              transitionVisible ? "" : "hide"
            }`}
          >
            <div className="bs-transition-ring" />
            <div className="bs-transition-ring second" />

            <div className="bs-transition-content">
              <div className="bs-transition-world">
                ENTERING NEW WORLD
              </div>

              <div className="bs-transition-title">
                {worldName}
              </div>

              <div className="bs-transition-level">
                LEVEL {currentLevelId}
              </div>

              <div className="bs-transition-line" />
            </div>
          </div>
        )}

        <div className="bs-world-label">
          {worldName}
        </div>

        <div className="bs-touch-hint">
          👆 DRAG TO AIM • RELEASE TO SHOOT
        </div>

        <GameBoard3D
          board={sceneState.board}
          current={sceneState.current}
          angle={sceneState.angle}
          effects={sceneState.effects}
          levelId={currentLevelId}
        />

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handlePointerCancel}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            cursor: "crosshair",
            touchAction: "none",
            background: "transparent",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        />

        {/* NEXT BUBBLE */}

        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 4,
            padding: "6px 9px",
            background: "#0f172add",
            border: "1px solid #38bdf866",
            borderRadius: 10,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <small
            style={{
              display: "block",
              color: "#94a3b8",
              fontSize: 9,
            }}
          >
            NEXT
          </small>

          <span
            style={{
              display: "inline-block",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background:
                COLOR_MAP[hud?.next || g?.next] || "#fff",
            }}
          />
        </div>

        {/* MESSAGE */}

        {message && !hud?.outcome && (
          <div
            style={{
              position: "absolute",
              zIndex: 5,
              top: "42%",
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fde68a",
              fontSize: 20,
              fontWeight: 900,
              pointerEvents: "none",
            }}
          >
            {message}
          </div>
        )}

        {/* PAUSE SCREEN */}

        {paused && !hud?.outcome && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              background: "#020617df",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2>⏸ PAUSED</h2>

            <button className="bs-btn" onClick={togglePause}>
              ▶ Resume
            </button>

            <button className="bs-btn" onClick={restart}>
              ↻ Restart
            </button>
          </div>
        )}

        {/* GAME OVER / LEVEL COMPLETE */}

        {hud?.outcome && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 11,
              background: "#020617ed",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
              padding: 14,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 52 }}>
              {hud.outcome === "WON" ? "🏆" : "💔"}
            </div>

            <h2
              style={{
                margin: 0,
                color:
                  hud.outcome === "WON"
                    ? "#34d399"
                    : "#fb7185",
              }}
            >
              {hud.outcome === "WON"
                ? "LEVEL CLEARED!"
                : "GAME OVER"}
            </h2>

            {hud.outcome === "WON" && (
              <>
                <div
                  style={{
                    fontSize: 34,
                    color: "#fbbf24",
                  }}
                >
                  {"★".repeat(stars)}
                  {"☆".repeat(3 - stars)}
                </div>

                <strong>{stars} / 3 STARS</strong>
              </>
            )}

            <strong style={{ fontSize: 19 }}>
              Score: {hud.score}
            </strong>

            {hud.outcome === "WON" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 260,
                  padding: 9,
                  borderRadius: 9,
                  background: "#1e293b",
                  fontSize: 12,
                  color:
                    saveStatus.state === "error"
                      ? "#fca5a5"
                      : saveStatus.state === "saved"
                      ? "#86efac"
                      : "#bfdbfe",
                  boxSizing: "border-box",
                }}
              >
                {saveStatus.state === "saving" &&
                  "⏳ Saving your progress..."}

                {saveStatus.state === "saved" &&
                  "✓ Progress saved successfully!"}

                {saveStatus.state === "idle" &&
                  "Preparing your progress..."}

                {saveStatus.state === "error" && (
                  <>
                    <div>
                      {saveStatus.message ||
                        "Could not save progress."}
                    </div>

                    {saveStatus.canRetry && (
                      <button
                        className="bs-btn"
                        onClick={onRetrySave}
                      >
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

            <button
              className="bs-btn"
              onClick={onLevelsClick || onExit}
            >
              ☰ Back to Levels
            </button>
          </div>
        )}

        {/* SETTINGS MODAL */}

        {settings && (
          <div
            onClick={() => setSettings(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              background: "rgba(2,6,23,.82)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                padding: 26,
                borderRadius: 22,
                background: "linear-gradient(145deg,#172554,#0f172a)",
                border: "1px solid rgba(56,189,248,.45)",
                boxShadow: "0 20px 70px rgba(0,0,0,.65)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                color: "#fff",
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>⚙️</div>

                <h2
                  style={{
                    margin: "8px 0 4px",
                    fontSize: 23,
                    letterSpacing: 2,
                    color: "#7dd3fc",
                  }}
                >
                  SETTINGS
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  Customize your game experience
                </p>
              </div>

              <div
                style={{
                  width: "100%",
                  padding: 15,
                  borderRadius: 13,
                  background: "rgba(255,255,255,.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <strong style={{ display: "block" }}>
                    Game Sound
                  </strong>

                  <small style={{ color: "#94a3b8" }}>
                    Sound effects and music
                  </small>
                </div>

                <button
                  className="bs-btn"
                  onClick={() => setSound((value) => !value)}
                  style={{
                    background: sound ? "#047857" : "#475569",
                    minWidth: 95,
                  }}
                >
                  {sound ? "🔊 ON" : "🔇 OFF"}
                </button>
              </div>

              <button
                className="bs-btn"
                onClick={() => setSettings(false)}
                style={{
                  width: "100%",
                  padding: 13,
                  borderRadius: 12,
                  background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                  border: "none",
                  fontSize: 14,
                }}
              >
                ✓ DONE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOOSTERS AND CONTROLS */}

      <div className="bs-controls">
        {boosters.map((booster) => {
          const count =
            hud?.boosters?.[booster.id] ?? 0;

          const active = hud?.armed === booster.id;

          return (
            <button
              key={booster.id}
              className="bs-btn"
              onClick={() => toggleBooster(booster.id)}
              disabled={!count}
              style={{
                background: active
                  ? "linear-gradient(135deg,#be123c,#881337)"
                  : undefined,
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

        <button className="bs-btn" onClick={swap}>
          <span style={{ fontSize: 20 }}>🔄</span>
          <span style={{ fontSize: 10 }}>Swap</span>
          <span style={{ fontSize: 9 }}>Key S</span>
        </button>

        <button
          className="bs-btn"
          onClick={hint}
          disabled={hintCount <= 0}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ fontSize: 10 }}>Hint ×{hintCount}</span>
          <span style={{ fontSize: 9 }}>Key H</span>
        </button>
      </div>

      {/* GAME INFO */}

      <div className="bs-game-info">
        <span>🫧 Remaining: {hud?.remaining ?? 0}</span>
        <span>Shots: {hud?.shots ?? actualLevel.shots}</span>
        <span>Best: {bestScore}</span>
        <span>Space: Shoot • S: Swap • Esc: Pause</span>
      </div>
    </div>
  );
}
