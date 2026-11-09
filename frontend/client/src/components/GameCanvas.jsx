import React, { useCallback, useEffect, useRef, useState } from "react";

const W = 360;
const H = 520;
const R = 16;
const STEP_X = 34;
const STEP_Y = Math.sqrt(3) * R;
const COLS = 10;
const BOARD_ROWS = 13;
const START_ROWS = 6;
const COLORS = [
  "#38bdf8",
  "#fbbf24",
  "#ec4899",
  "#10b981",
  "#a855f7",
  "#f97316",
];

const randomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

const center = (r, c) => ({
  x: 28 + c * STEP_X + (r % 2 ? R : 0),
  y: 24 + R + r * STEP_Y,
});

function createBoard(level = 1) {
  const filledRows = Math.min(
    START_ROWS + Math.floor((level - 1) / 3),
    10
  );

  return Array.from({ length: BOARD_ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      ...center(r, c),
      color: randomColor(),
      active: r < filledRows,
    }))
  );
}

// Hexagonal grid neighbours
function getNeighbors(r, c, rows, cols) {
  const offsets =
    r % 2 === 0
      ? [
          [0, -1],
          [0, 1],
          [-1, -1],
          [-1, 0],
          [1, -1],
          [1, 0],
        ]
      : [
          [0, -1],
          [0, 1],
          [-1, 0],
          [-1, 1],
          [1, 0],
          [1, 1],
        ];

  return offsets
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(
      ([nr, nc]) =>
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols
    );
}

// Find connected bubbles of the same colour
function getCluster(board, startR, startC) {
  const start = board[startR]?.[startC];

  if (!start || !start.active) return [];

  const rows = board.length;
  const cols = board[0].length;

  const queue = [[startR, startC]];
  const visited = new Set([`${startR},${startC}`]);
  const result = [];

  while (queue.length) {
    const [r, c] = queue.shift();
    result.push([r, c]);

    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      const key = `${nr},${nc}`;
      const bubble = board[nr][nc];

      if (
        !visited.has(key) &&
        bubble.active &&
        bubble.color === start.color
      ) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  return result;
}

// Find bubbles that are no longer connected to the ceiling
function getFloatingBubbles(board) {
  const rows = board.length;
  const cols = board[0].length;

  const connected = new Set();
  const queue = [];

  for (let c = 0; c < cols; c++) {
    if (board[0][c].active) {
      queue.push([0, c]);
      connected.add(`0,${c}`);
    }
  }

  while (queue.length) {
    const [r, c] = queue.shift();

    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      const key = `${nr},${nc}`;

      if (
        board[nr][nc].active &&
        !connected.has(key)
      ) {
        connected.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  const floating = [];

  board.forEach((row, r) => {
    row.forEach((bubble, c) => {
      if (
        bubble.active &&
        !connected.has(`${r},${c}`)
      ) {
        floating.push([r, c]);
      }
    });
  });

  return floating;
}

function createGame(level = 1) {
  return {
    board: createBoard(level),
    rows: BOARD_ROWS,
    cols: COLS,
    level,
    angle: -Math.PI / 2,
    current: randomColor(),
    next: randomColor(),
    score: 0,
    shots: 35,
    combo: 0,
    bestCombo: 0,
    hints: 3,
    boosters: {
      bomb: 2,
      rainbow: 2,
      fire: 1,
    },
    armed: null,
    heldColor: null,
    status: "READY",
    paused: false,
    hintActive: false,
  };
}

function drawBubble(ctx, x, y, color, radius = R) {
  const gradient = ctx.createRadialGradient(
    x - 5,
    y - 6,
    2,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.18, color);
  gradient.addColorStop(1, color);

  ctx.save();
  ctx.shadowColor = color;
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

export default function GameCanvas({
  levelId = 1,
  onExit = null,
  onLevelsClick = null,
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animationRef = useRef(null);

  const [hud, setHud] = useState(null);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [bestScore, setBestScore] = useState(0);

  if (!gameRef.current) {
    gameRef.current = createGame(levelId);
  }

  const game = gameRef.current;

  const sync = useCallback((outcome = null) => {
    const g = gameRef.current;

    setHud({
      score: g.score,
      shots: g.shots,
      combo: g.combo,
      bestCombo: g.bestCombo,
      current: g.current,
      next: g.next,
      hints: g.hints,
      boosters: { ...g.boosters },
      armed: g.armed,
      level: g.level,
      outcome,
    });

    setBestScore((old) => Math.max(old, g.score));
  }, []);

  // Draw the complete game
  const render = useCallback((flying = null) => {
    const g = gameRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !g) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);

    // Background stars
    ctx.fillStyle = "rgba(255,255,255,.35)";

    for (let i = 0; i < 25; i++) {
      const x = (i * 83 + 19) % W;
      const y = (i * 47 + 13) % H;

      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Draw bubbles
    g.board.forEach((row) => {
      row.forEach((bubble) => {
        if (bubble.active) {
          drawBubble(
            ctx,
            bubble.x,
            bubble.y,
            bubble.color
          );
        }
      });
    });

    // Aim line
    let x = W / 2;
    let y = H - 48;

    let vx = Math.cos(g.angle) * 10;
    let vy = Math.sin(g.angle) * 10;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < 35; i++) {
      x += vx;
      y += vy;

      if (x < R || x > W - R) {
        vx *= -1;
      }

      if (y < 10) break;

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = g.hintActive
      ? "#fbbf24"
      : "rgba(255,255,255,.4)";

    ctx.lineWidth = g.hintActive ? 3 : 1.5;
    ctx.setLineDash([5, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Launcher
    ctx.save();

    ctx.translate(W / 2, H - 48);
    ctx.rotate(g.angle);

    ctx.fillStyle = "#7dd3fc";
    ctx.fillRect(0, -7, 40, 14);

    ctx.restore();

    ctx.beginPath();
    ctx.arc(W / 2, H - 48, 21, 0, Math.PI * 2);

    ctx.fillStyle = "#0f172a";
    ctx.fill();

    ctx.strokeStyle = g.armed
      ? "#fbbf24"
      : "#38bdf8";

    ctx.lineWidth = 3;
    ctx.stroke();

    const launcherColor =
      g.armed === "bomb"
        ? "#ef4444"
        : g.armed === "rainbow"
        ? "#a855f7"
        : g.armed === "fire"
        ? "#f97316"
        : g.current;

    drawBubble(
      ctx,
      W / 2,
      H - 48,
      launcherColor,
      15
    );

    // Flying bubble
    if (flying) {
      drawBubble(
        ctx,
        flying.x,
        flying.y,
        flying.color,
        15
      );
    }

    // Danger line
    ctx.beginPath();
    ctx.moveTo(0, H - 115);
    ctx.lineTo(W, H - 115);

    ctx.strokeStyle = "rgba(248,113,113,.5)";
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // Check win or lose
  const checkGame = useCallback(() => {
    const g = gameRef.current;

    const remaining = g.board.some((row) =>
      row.some((bubble) => bubble.active)
    );

    if (!remaining) {
      g.status = "WON";
      sync("WON");
      render();
      return;
    }

    const active = g.board
      .flat()
      .filter((bubble) => bubble.active);

    const lowest = active.reduce(
      (max, bubble) => Math.max(max, bubble.y),
      0
    );

    if (g.shots <= 0 || lowest >= H - 105) {
      g.status = "LOST";
      sync("LOST");
      render();
      return;
    }

    g.status = "READY";

    sync();
    render();
  }, [render, sync]);

  // Restart
  const restart = useCallback(
    (level = gameRef.current.level) => {
      cancelAnimationFrame(animationRef.current);

      gameRef.current = createGame(level);

      setPaused(false);
      setMessage("");
      setSettings(false);

      sync();
      render();
    },
    [render, sync]
  );

  const nextLevel = useCallback(() => {
    restart(gameRef.current.level + 1);
  }, [restart]);

  // Pause
  const togglePause = useCallback(() => {
    const g = gameRef.current;

    if (g.status !== "READY") return;

    g.paused = !g.paused;

    setPaused(g.paused);
    render();
  }, [render]);

  // Aim
  const setAim = useCallback(
    (e) => {
      const g = gameRef.current;

      if (g.status !== "READY" || g.paused) return;

      const rect = canvasRef.current.getBoundingClientRect();

      const mx =
        ((e.clientX - rect.left) / rect.width) * W;

      const my =
        ((e.clientY - rect.top) / rect.height) * H;

      let angle = Math.atan2(
        my - (H - 48),
        mx - W / 2
      );

      angle = Math.max(
        -Math.PI + 0.12,
        Math.min(-0.12, angle)
      );

      g.angle = angle;

      render();
    },
    [render]
  );

  // Remove matched bubbles or use booster
  const popBubbles = useCallback(
    (r, c, special = null, shotColor = null) => {
      const g = gameRef.current;
      const board = g.board;

      let popped = [];

      if (special === "bomb") {
        for (
          let rr = Math.max(0, r - 1);
          rr <= Math.min(g.rows - 1, r + 1);
          rr++
        ) {
          for (
            let cc = Math.max(0, c - 1);
            cc <= Math.min(g.cols - 1, c + 1);
            cc++
          ) {
            if (board[rr][cc].active) {
              popped.push([rr, cc]);
            }
          }
        }
      } else if (special === "rainbow") {
        const targetColor = board[r][c].color;

        board.forEach((row, rr) => {
          row.forEach((bubble, cc) => {
            if (
              bubble.active &&
              bubble.color === targetColor
            ) {
              popped.push([rr, cc]);
            }
          });
        });
      } else if (special === "fire") {
        board.forEach((row, rr) => {
          row.forEach((bubble, cc) => {
            if (
              bubble.active &&
              bubble.color === shotColor
            ) {
              popped.push([rr, cc]);
            }
          });
        });
      } else {
        popped = getCluster(board, r, c);

        // Regular shot needs at least 3 connected bubbles
        if (popped.length < 3) {
          g.combo = 0;
          g.misses++;
          sync();
          render();
          return false;
        }
      }

      // Remove popped bubbles
      popped.forEach(([rr, cc]) => {
        board[rr][cc].active = false;
      });

      // Remove unsupported bubbles
      const floating = getFloatingBubbles(board);

      floating.forEach(([rr, cc]) => {
        board[rr][cc].active = false;
      });

      const total = popped.length + floating.length;

      g.score +=
        popped.length * 10 +
        floating.length * 20;

      if (total > 0) {
        g.combo++;
        g.bestCombo = Math.max(
          g.bestCombo,
          g.combo
        );

        setMessage(
          floating.length > 0
            ? `🔥 ${total} BUBBLES POPPED!`
            : `+${popped.length * 10} POINTS!`
        );
      }

      sync();
      render();

      return true;
    },
    [render, sync]
  );

  // Find nearest empty neighbouring cell
  const findEmptyNeighbor = useCallback((r, c) => {
    const g = gameRef.current;

    const candidates = getNeighbors(
      r,
      c,
      g.rows,
      g.cols
    )
      .filter(([rr, cc]) => !g.board[rr][cc].active)
      .map(([rr, cc]) => {
        const pos = center(rr, cc);

        return {
          r: rr,
          c: cc,
          distance: Math.hypot(
            pos.x - g.board[r][c].x,
            pos.y - g.board[r][c].y
          ),
        };
      })
      .sort((a, b) => a.distance - b.distance);

    return candidates[0] || null;
  }, []);

  // Attach a bubble to the board
  const attachBubble = useCallback(
    (r, c, color, special = null) => {
      const g = gameRef.current;

      if (special) {
        popBubbles(r, c, special, color);
        return;
      }

      const target = findEmptyNeighbor(r, c);

      if (!target) {
        checkGame();
        return;
      }

      const pos = center(target.r, target.c);

      g.board[target.r][target.c] = {
        ...pos,
        color,
        active: true,
      };

      // IMPORTANT: Match check happens at the newly attached bubble
      popBubbles(
        target.r,
        target.c,
        null,
        color
      );

      checkGame();
    },
    [checkGame, findEmptyNeighbor, popBubbles]
  );

  // Shoot bubble
  const shoot = useCallback(() => {
    const g = gameRef.current;

    if (
      g.status !== "READY" ||
      g.paused
    ) {
      return;
    }

    const color = g.current;
    const special = g.armed;

    if (special && g.boosters[special] <= 0) {
      return;
    }

    if (special) {
      g.boosters[special]--;
      g.armed = null;
      g.heldColor = null;
    }

    g.shots--;

    g.current = g.next;
    g.next = randomColor();

    const speed = 10;

    let x = W / 2;
    let y = H - 48;

    let vx = Math.cos(g.angle) * speed;
    let vy = Math.sin(g.angle) * speed;

    const tick = () => {
      if (
        g.paused ||
        g.status !== "READY"
      ) {
        return;
      }

      x += vx;
      y += vy;

      // Wall bounce
      if (x < R) {
        x = R;
        vx = Math.abs(vx);
      }

      if (x > W - R) {
        x = W - R;
        vx = -Math.abs(vx);
      }

      let hit = null;

      // Collision detection
      for (let r = 0; r < g.rows && !hit; r++) {
        for (let c = 0; c < g.cols; c++) {
          const bubble = g.board[r][c];

          if (!bubble.active) continue;

          const distance = Math.hypot(
            x - bubble.x,
            y - bubble.y
          );

          if (distance < R * 2 - 2) {
            hit = [r, c];
            break;
          }
        }
      }

      // Hit another bubble
      if (hit) {
        attachBubble(
          hit[0],
          hit[1],
          color,
          special
        );

        sync();
        return;
      }

      // Hit ceiling
      if (y <= R + 5) {
        const targetC = Math.max(
          0,
          Math.min(
            COLS - 1,
            Math.round(
              (x - 28) / STEP_X
            )
          )
        );

        const emptyTop = g.board[0]
          .map((bubble, c) =>
            !bubble.active ? c : null
          )
          .filter((c) => c !== null);

        if (emptyTop.length) {
          const c = emptyTop.sort(
            (a, b) =>
              Math.abs(a - targetC) -
              Math.abs(b - targetC)
          )[0];

          g.board[0][c] = {
            ...center(0, c),
            color,
            active: true,
          };

          popBubbles(0, c, null, color);
        }

        checkGame();
        return;
      }

      // Keep drawing flying bubble
      render({
        x,
        y,
        color:
          special === "bomb"
            ? "#ef4444"
            : special === "rainbow"
            ? "#a855f7"
            : color,
      });

      animationRef.current =
        requestAnimationFrame(tick);
    };

    sync();

    animationRef.current =
      requestAnimationFrame(tick);
  }, [
    attachBubble,
    checkGame,
    popBubbles,
    render,
    sync,
  ]);

  // Booster selection
  const toggleBooster = useCallback(
    (type) => {
      const g = gameRef.current;

      if (
        g.status !== "READY" ||
        g.paused
      ) {
        return;
      }

      if (g.armed === type) {
        g.armed = null;
        g.current = g.heldColor || g.current;
        g.heldColor = null;
      } else if (g.boosters[type] > 0) {
        if (!g.armed) {
          g.heldColor = g.current;
        }

        g.armed = type;
      }

      sync();
      render();
    },
    [render, sync]
  );

  // Swap current and next bubbles
  const swap = useCallback(() => {
    const g = gameRef.current;

    if (
      g.status !== "READY" ||
      g.paused ||
      g.armed
    ) {
      return;
    }

    [g.current, g.next] = [
      g.next,
      g.current,
    ];

    sync();
    render();
  }, [render, sync]);

  // Hint
  const hint = useCallback(() => {
    const g = gameRef.current;

    if (
      g.status !== "READY" ||
      g.paused ||
      g.hints <= 0
    ) {
      return;
    }

    g.hints--;
    g.hintActive = true;

    setMessage("💡 Aim at matching bubbles!");

    sync();
    render();

    window.setTimeout(() => {
      g.hintActive = false;
      render();
    }, 2000);
  }, [render, sync]);

  // Keyboard controls
  useEffect(() => {
    sync();
    render();

    const onKeyDown = (e) => {
      if (e.repeat) return;

      if (e.key === "Escape") {
        togglePause();
      }

      if (e.key.toLowerCase() === "r") {
        restart();
      }

      if (e.key.toLowerCase() === "s") {
        swap();
      }

      if (e.key.toLowerCase() === "h") {
        hint();
      }

      if (e.key === " " && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        shoot();
      }

      if (e.key === "1") toggleBooster("bomb");
      if (e.key === "2") toggleBooster("rainbow");
      if (e.key === "3") toggleBooster("fire");
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [
    hint,
    render,
    restart,
    shoot,
    swap,
    sync,
    toggleBooster,
    togglePause,
  ]);

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
    {
      id: "fire",
      icon: "🔥",
      label: "Fire",
      key: "3",
    },
  ];

  return (
    <div
      style={{
        width: W,
        maxWidth: "100%",
        margin: "0 auto",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes popText {
          0% {
            transform: translateY(8px) scale(.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1.08);
          }
          100% {
            opacity: 0;
            transform: translateY(-24px) scale(1);
          }
        }

        .bs-btn {
          border: 1px solid rgba(125,211,252,.25);
          background: #172554;
          color: #fff;
          border-radius: 9px;
          padding: 8px 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .bs-btn:active {
          transform: scale(.96);
        }

        .bs-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
      `}</style>

      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          padding: 9,
          background: "#111827",
          borderRadius: 12,
          marginBottom: 8,
          border: "1px solid #1e3a5f",
          fontSize: 12,
        }}
      >
        <button
          className="bs-btn"
          onClick={
            onLevelsClick ||
            onExit ||
            (() => {})
          }
        >
          ☰ Levels
        </button>

        <strong style={{ color: "#7dd3fc" }}>
          LEVEL {hud?.level ?? levelId}
        </strong>

        <strong>
          ⭐ {hud?.score ?? 0}
        </strong>

        <button
          className="bs-btn"
          onClick={() => setSettings(true)}
        >
          ⚙️
        </button>

        <button
          className="bs-btn"
          onClick={togglePause}
        >
          Ⅱ
        </button>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#cbd5e1",
          margin: "0 4px 7px",
        }}
      >
        <span>
          🎯 {hud?.shots ?? 35} shots
        </span>

        <span>
          🏆 Best: {bestScore}
        </span>

        <span>
          🔥 Combo x{hud?.combo ?? 0}
        </span>
      </div>

      {/* GAME BOARD */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          border: "2px solid rgba(56,189,248,.35)",
          background:
            "radial-gradient(circle at 50% 35%,#1e3a5f,#071326 75%)",
          boxShadow: "0 15px 35px #0009",
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={setAim}
          onPointerDown={setAim}
          onPointerUp={(e) => {
            setAim(e);
            shoot();
          }}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            touchAction: "none",
            cursor: "crosshair",
          }}
        />

        {/* NEXT BUBBLE */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            padding: "6px 9px",
            background: "#0f172add",
            border: "1px solid #38bdf866",
            borderRadius: 10,
            textAlign: "center",
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
              background: hud?.next || game.next,
              boxShadow: `0 0 10px ${
                hud?.next || game.next
              }`,
            }}
          />
        </div>

        {/* POP MESSAGE */}
        {message && !hud?.outcome && (
          <div
            key={message}
            style={{
              position: "absolute",
              top: "42%",
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fde68a",
              fontSize: 24,
              fontWeight: 900,
              textShadow: "0 3px 12px #000",
              pointerEvents: "none",
              animation: "popText 1.3s forwards",
            }}
          >
            {message}
          </div>
        )}

        {/* PAUSE MENU */}
        {paused && !hud?.outcome && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#020617df",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2>⏸ PAUSED</h2>

            <button
              className="bs-btn"
              onClick={togglePause}
            >
              ▶ Resume
            </button>

            <button
              className="bs-btn"
              onClick={() => restart()}
            >
              ↻ Restart
            </button>

            <button
              className="bs-btn"
              onClick={() => setSettings(true)}
            >
              ⚙️ Settings
            </button>
          </div>
        )}

        {/* WIN / LOSE MENU */}
        {hud?.outcome && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#020617ed",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42 }}>
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

            <strong>
              Score: {hud.score}
            </strong>

            {hud.outcome === "WON" ? (
              <button
                className="bs-btn"
                onClick={nextLevel}
              >
                Next Level ➜
              </button>
            ) : (
              <button
                className="bs-btn"
                onClick={() => restart()}
              >
                ↻ Try Again
              </button>
            )}

            <button
              className="bs-btn"
              onClick={() => restart(1)}
            >
              Start Level 1
            </button>
          </div>
        )}

        {/* SETTINGS */}
        {settings && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#020617ed",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2>⚙️ SETTINGS</h2>

            <button
              className="bs-btn"
              onClick={() => setSound((v) => !v)}
            >
              {sound ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>

            <button
              className="bs-btn"
              onClick={() => setMusic((v) => !v)}
            >
              {music ? "🎵 Music ON" : "🔕 Music OFF"}
            </button>

            <button
              className="bs-btn"
              onClick={() => setSettings(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* BOOSTERS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: 7,
          padding: 10,
          marginTop: 9,
          background: "#111827",
          border: "1px solid #1e3a5f",
          borderRadius: 14,
        }}
      >
        {boosters.map((booster) => {
          const count =
            hud?.boosters?.[booster.id] ??
            game.boosters[booster.id];

          const active =
            hud?.armed === booster.id;

          return (
            <button
              key={booster.id}
              className="bs-btn"
              onClick={() =>
                toggleBooster(booster.id)
              }
              disabled={!count}
              style={{
                minWidth: 65,
                background: active
                  ? "#9f1239"
                  : "#172554",
                borderColor: active
                  ? "#fda4af"
                  : "#1e3a5f",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 20,
                }}
              >
                {booster.icon}
              </span>

              <span
                style={{
                  display: "block",
                  fontSize: 10,
                }}
              >
                {booster.label} ×{count}
              </span>

              <span
                style={{
                  display: "block",
                  fontSize: 9,
                  color: "#94a3b8",
                }}
              >
                Key {booster.key}
              </span>
            </button>
          );
        })}

        <button
          className="bs-btn"
          onClick={swap}
        >
          <span
            style={{
              display: "block",
              fontSize: 20,
            }}
          >
            🔄
          </span>

          <span style={{ fontSize: 10 }}>
            Swap
          </span>
        </button>

        <button
          className="bs-btn"
          onClick={hint}
        >
          <span
            style={{
              display: "block",
              fontSize: 20,
            }}
          >
            💡
          </span>

          <span style={{ fontSize: 10 }}>
            Hint ×{hud?.hints ?? 3}
          </span>
        </button>
      </div>

      {/* HELP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          color: "#94a3b8",
          fontSize: 10,
        }}
      >
        <span>Drag to aim • Release to shoot</span>
        <span>Space: Shoot • Esc: Pause</span>
      </div>
    </div>
  );
}