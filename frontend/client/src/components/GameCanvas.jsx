import { useEffect, useRef, useState } from "react";
import { BOARD_WIDTH } from "../game/constants.js";
import { boardFromLayout, cellToPixel } from "../game/hexGrid.js";
import { traceShot } from "../game/collision.js";
import { resolveShot } from "../game/shotResolver.js";
import { findBestShot } from "../game/hint.js";
import { makeRng } from "../game/rng.js";
import { pickColor } from "../game/bubbleQueue.js";
import { calculateShotScore, calculateStars } from "../game/scoreManager.js";
import {
  isObjectiveComplete,
  objectiveProgress,
  countBubbles,
} from "../game/objectiveManager.js";
import {
  createEffects,
  addPop,
  addFall,
  updateEffects,
  hasActiveEffects,
  drawEffects,
} from "../game/effects.js";
import { LEVELS } from "../data/levels.js";
import {
  sfx,
  getAudioSettings,
  setSoundEnabled,
  setMusicEnabled,
  startMusic,
  stopMusic,
} from "../game/audio.js";
import {
  drawBoard,
  drawBubble,
  drawTrajectory,
  drawLauncher,
  drawHint,
} from "../game/renderer.js";

// NOTE: the server uses the same numbers to replay games
// (server/src/services/validateSession.js). Change them in both places.
const CANVAS_HEIGHT = 600;
const LAUNCHER_X = BOARD_WIDTH / 2;
const LAUNCHER_Y = CANVAS_HEIGHT - 60;
const SHOT_SPEED = 16; // pixels per frame
const HINT_SHOW_MS = 3500; // how long the golden hint line stays visible

// Launcher can't aim fully sideways: keep between 15 and 165 degrees
const MIN_ANGLE = (15 * Math.PI) / 180;
const MAX_ANGLE = Math.PI - MIN_ANGLE;

// Every level gets these unless it defines its own `boosters: { bomb, rainbow }`
const DEFAULT_BOOSTERS = { bomb: 2, rainbow: 2 };
const HINTS_PER_LEVEL = 3;

const BOOSTERS = [
  { id: "bomb", icon: "💣", name: "Bomb", key: "1", info: "pops every bubble around where it lands" },
  { id: "rainbow", icon: "🌈", name: "Rainbow", key: "2", info: "matches with any colour" },
];

// Fresh game state for a level. `seed` makes the bubble queue repeatable,
// so the server can replay exactly this game.
function createGame(level, seed) {
  const board = boardFromLayout(level.layout);
  const rng = makeRng(seed);
  return {
    board,
    rng,
    angle: Math.PI / 2,
    current: pickColor(board, rng),
    next: pickColor(board, rng),
    held: null, // normal bubble that is waiting while a booster is armed
    armed: null, // null | "bomb" | "rainbow"
    boosters: { ...DEFAULT_BOOSTERS, ...(level.boosters || {}) },
    hints: HINTS_PER_LEVEL,
    hint: null, // { path, cell } while a hint is on screen
    shotLog: [], // every shot fired: { angle, color, r, c } (sent to the server)
    status: "READY", // READY | SHOOTING | RESOLVING | WON | LOST
    paused: false, // pause freezes shooting, animations and music
    score: 0,
    shots: level.shots,
    combo: 0, // consecutive successful shots
    bestCombo: 0,
    floatingDropped: 0, // bubbles that fell (for "Drop" levels)
    effects: createEffects(),
  };
}

// Everything the HUD needs, copied out of the game state
function snapshot(g, outcome = null, stars = 0) {
  return {
    score: g.score,
    shots: g.shots,
    combo: g.combo,
    bestCombo: g.bestCombo,
    floatingDropped: g.floatingDropped,
    boosters: { ...g.boosters },
    hints: g.hints,
    armed: g.armed,
    outcome,
    stars,
  };
}

const COMBO_CSS = `
@keyframes comboPop {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
  25%  { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
  70%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -80%) scale(1); opacity: 0; }
}
`;

export default function GameCanvas({
  level = LEVELS[0],
  seed = 1, // from the server (POST /api/games/start)
  saveStatus = null, // { state: "saving" | "saved" | "error", message, canRetry }
  onFinish = null, // called when the level ends: onFinish({ outcome, shots, score })
  onRetrySave = null, // "Try saving again" button
  onRestart = null, // asks the page for a NEW game session
  onNext = null, // called when player presses "Next Level"
  onExit = null, // called when player presses "Levels"
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const hintTimerRef = useRef(null);
  const actionsRef = useRef({}); // always holds the latest functions (for keyboard)

  if (!gameRef.current) gameRef.current = createGame(level, seed);

  // React state only for the HUD / overlay (canvas itself is drawn from the ref)
  const [hud, setHud] = useState(() => snapshot(gameRef.current));
  const [comboFlash, setComboFlash] = useState(null); // { combo, id }
  const [paused, setPaused] = useState(false);
  const [hintText, setHintText] = useState("");

  const [soundOn, setSoundOn] = useState(getAudioSettings().sound);
  const [musicOn, setMusicOn] = useState(getAudioSettings().music);

  const saving = saveStatus?.state === "saving";
  const nextReady = !saveStatus || saveStatus.state === "saved";

  function toggleSound() {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) sfx.click(); // confirmation beep when turning ON
  }

  function toggleMusic() {
    const next = !musicOn;
    setMusicEnabled(next); // starts or stops the music immediately
    setMusicOn(next);
  }

  function render(flying) {
    const g = gameRef.current;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, BOARD_WIDTH, CANVAS_HEIGHT);
    drawBoard(ctx, g.board);
    drawEffects(ctx, g.effects);

    if (g.status === "READY") {
      const { path } = traceShot(g.board, LAUNCHER_X, LAUNCHER_Y, g.angle);
      drawTrajectory(ctx, path);
      if (g.hint) drawHint(ctx, g.hint.path, g.hint.cell);
    }
    drawLauncher(ctx, LAUNCHER_X, LAUNCHER_Y, g.angle, g.current, g.next);
    if (flying) drawBubble(ctx, flying.x, flying.y, flying.color);
  }

  useEffect(() => {
    render();

    // Browsers only allow audio after a click, so start music on first click too
    startMusic();
    const kick = () => {
      if (!gameRef.current.paused) startMusic();
    };
    window.addEventListener("pointerdown", kick, { once: true });

    // Keyboard: Esc = pause, R = restart, Space = shoot, 1 = Bomb, 2 = Rainbow, H = hint
    const onKey = (e) => {
      if (e.repeat) return;
      const a = actionsRef.current;
      if (e.key === "Escape") {
        a.togglePause();
      } else if (e.key === "r" || e.key === "R") {
        a.restart();
      } else if (e.key === "h" || e.key === "H") {
        a.showHint();
      } else if (e.key === "1") {
        a.toggleBooster("bomb");
      } else if (e.key === "2") {
        a.toggleBooster("rainbow");
      } else if (e.key === " " && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        a.shoot();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hintTimerRef.current);
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", onKey);
      stopMusic();
    };
  }, []);

  function clearHint() {
    clearTimeout(hintTimerRef.current);
    gameRef.current.hint = null;
    setHintText("");
  }

  function togglePause() {
    const g = gameRef.current;
    if (g.status === "WON" || g.status === "LOST") return; // nothing to pause
    g.paused = !g.paused;
    setPaused(g.paused);
    if (g.paused) {
      stopMusic();
    } else {
      startMusic(); // only plays if Music is ON in settings
    }
    render();
  }

  function restart() {
    if (saving) return; // wait until the finished game is saved
    sfx.click();

    // normal case: the page gets a NEW session (new seed) and rebuilds this game
    if (onRestart) {
      onRestart();
      return;
    }

    // fallback when no page is controlling the game
    cancelAnimationFrame(rafRef.current);
    clearTimeout(hintTimerRef.current);
    gameRef.current = createGame(level, seed);
    setPaused(false);
    setHintText("");
    setHud(snapshot(gameRef.current));
    setComboFlash(null);
    startMusic();
    render();
  }

  // Shows the best shot for the bubble currently in the launcher
  function showHint() {
    const g = gameRef.current;

    // validation: only between shots, never when paused or after the level ended
    if (g.status !== "READY" || g.paused) return;
    if (g.hints <= 0) {
      setHintText("No hints left on this level");
      return;
    }

    const best = findBestShot(
      g.board,
      LAUNCHER_X,
      LAUNCHER_Y,
      g.current,
      MIN_ANGLE,
      MAX_ANGLE
    );

    sfx.click();

    if (!best) {
      // no match is possible with this bubble: nothing is spent
      setHintText("💡 No match possible with this bubble. Try setting up a shot.");
      return;
    }

    g.hints -= 1;
    g.hint = { path: best.path, cell: best.cell };

    let text = `💡 Hint: pops ${best.popped} bubble${best.popped === 1 ? "" : "s"}`;
    if (best.floating > 0) text += ` and drops ${best.floating}`;
    if (best.path.length > 2) text += " (bank shot off the wall!)";
    text += ". Aim along the golden line.";
    setHintText(text);

    setHud(snapshot(g));
    render();

    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      clearHint();
      if (canvasRef.current) render();
    }, HINT_SHOW_MS);
  }

  // Arm / disarm a booster. It replaces the current bubble until you shoot.
  function toggleBooster(type) {
    const g = gameRef.current;

    // validation: only between shots, never when paused or after the level ended
    if (g.status !== "READY" || g.paused) return;
    if (countBubbles(g.board) === 0) return; // nothing to hit

    clearHint(); // an old hint was for a different bubble

    if (g.armed === type) {
      // tapping again cancels: the normal bubble comes back, nothing is spent
      g.current = g.held;
      g.held = null;
      g.armed = null;
    } else {
      if (g.boosters[type] <= 0) return; // none left
      if (g.armed) {
        // switching from the other booster: bring the normal bubble back first
        g.current = g.held;
        g.held = null;
        g.armed = null;
      }
      g.held = g.current;
      g.current = type;
      g.armed = type;
    }

    sfx.click();
    setHud(snapshot(g));
    render();
  }

  function updateAim(e) {
    const g = gameRef.current;
    if (g.status !== "READY" || g.paused) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) * BOARD_WIDTH) / rect.width;
    const my = ((e.clientY - rect.top) * CANVAS_HEIGHT) / rect.height;

    let angle = Math.atan2(LAUNCHER_Y - my, mx - LAUNCHER_X);
    g.angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
    render();
  }

  // Runs after the bubble has attached: starts effects, then finishes the turn
  function resolveTurn(cell, color) {
    const g = gameRef.current;
    const result = resolveShot(g.board, cell.r, cell.c, color);

    // combo: every match in a row raises it, a miss resets it
    if (result.matched) {
      g.combo += 1;
      g.bestCombo = Math.max(g.bestCombo, g.combo);
    } else {
      g.combo = 0;
    }

    // same function the server uses (includes the +100 for every chick rescued)
    g.score += calculateShotScore(result, Math.max(g.combo, 1));
    g.floatingDropped += result.floating.length;
    g.shots -= 1;

    // sounds (pitch goes higher with bigger groups and higher combos)
    if (result.special === "bomb") sfx.pop(10);
    else if (result.matched) sfx.pop(result.popped.length + g.combo - 1);
    else sfx.stick();
    if (result.floating.length > 0) sfx.fall();

    if (g.combo >= 2) setComboFlash({ combo: g.combo, id: Date.now() });

    // start animations
    for (const b of result.poppedBubbles) {
      const { x, y } = cellToPixel(b.r, b.c);
      addPop(g.effects, x, y, b.color);
    }
    for (const b of result.floatingBubbles) {
      const { x, y } = cellToPixel(b.r, b.c);
      addFall(g.effects, x, y, b.color);
    }

    // decide the result now, but show it after the animations finish.
    // The level is won the moment its OBJECTIVE is complete.
    let outcome = null;
    let stars = 0;
    const objectiveDone = isObjectiveComplete(level.objective, {
      board: g.board,
      score: g.score,
      floatingDropped: g.floatingDropped,
      bestCombo: g.bestCombo,
    });

    if (objectiveDone) {
      outcome = "WON";
      // a win always gives at least 1 star
      stars = Math.max(1, calculateStars(g.score, level.starThresholds));
    } else if (countBubbles(g.board) === 0 || g.shots <= 0) {
      outcome = "LOST"; // no bubbles left to work with, or out of shots
    }

    g.status = "RESOLVING"; // blocks shooting while animations play
    setHud(snapshot(g));

    const finish = () => {
      g.status = outcome || "READY";
      if (outcome === "WON") sfx.win();
      if (outcome === "LOST") sfx.lose();
      setHud(snapshot(g, outcome, stars));
      render();
      // send the shots to the server, which replays and saves the verified result
      if (outcome && onFinish) {
        onFinish({ outcome, shots: g.shotLog, score: g.score });
      }
    };

    const animate = () => {
      if (g.paused) {
        // frozen: keep waiting, do not move any animation forward
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      updateEffects(g.effects);
      render();
      if (hasActiveEffects(g.effects)) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        finish();
      }
    };
    animate();
  }

  function shoot() {
    const g = gameRef.current;
    if (g.status !== "READY" || g.paused) return; // no double shooting, none while paused

    const { path, cell } = traceShot(g.board, LAUNCHER_X, LAUNCHER_Y, g.angle);
    if (!cell) return;

    clearHint();
    g.status = "SHOOTING";
    sfx.shoot();
    const color = g.current;

    // remember this shot: the server will replay it
    g.shotLog.push({ angle: g.angle, color, r: cell.r, c: cell.c });

    if (g.armed) {
      // booster shot: spend one booster, then the held normal bubble comes back
      g.boosters[g.armed] -= 1;
      g.armed = null;
      g.current = g.held;
      g.held = null;
    } else {
      g.current = g.next;
      g.next = pickColor(g.board, g.rng);
    }
    setHud(snapshot(g));

    let seg = 0;
    let pos = { x: path[0].x, y: path[0].y };

    const step = () => {
      if (g.paused) {
        // frozen mid-flight: bubble stays where it is
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // move SHOT_SPEED pixels along the path (it may turn at bounce points)
      let remaining = SHOT_SPEED;
      while (remaining > 0 && seg < path.length - 1) {
        const target = path[seg + 1];
        const d = Math.hypot(target.x - pos.x, target.y - pos.y);
        if (d <= remaining) {
          pos = { x: target.x, y: target.y };
          remaining -= d;
          seg++;
        } else {
          pos = {
            x: pos.x + ((target.x - pos.x) * remaining) / d,
            y: pos.y + ((target.y - pos.y) * remaining) / d,
          };
          remaining = 0;
        }
      }

      if (seg >= path.length - 1) {
        resolveTurn(cell, color);
        return;
      }

      render({ x: pos.x, y: pos.y, color });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }

  // keep the keyboard handler pointing at the newest functions
  actionsRef.current = { togglePause, restart, shoot, toggleBooster, showHint };

  const armedInfo = BOOSTERS.find((b) => b.id === hud.armed);
  const barDisabled = paused || !!hud.outcome;

  // e.g. "🐣 Rescue 3 chicks · 1/3 rescued"
  const objectiveText = objectiveProgress(level.objective, {
    board: gameRef.current.board,
    score: hud.score,
    floatingDropped: hud.floatingDropped,
    bestCombo: hud.bestCombo,
  });

  let statusLine = "Tap a booster to arm it (uses 1 booster + 1 shot)";
  if (hintText) statusLine = hintText;
  else if (armedInfo)
    statusLine = `${armedInfo.icon} ${armedInfo.name} ready: ${armedInfo.info}. Shoot! (tap again to cancel)`;

  return (
    <div style={{ width: BOARD_WIDTH, maxWidth: "100%" }}>
      <style>{COMBO_CSS}</style>

      {/* HUD: kept above the board so it never covers the play area */}
      <div className="hud">
        {onExit && (
          <button onClick={onExit} className="icon-btn back-btn">
            ☰ Levels
          </button>
        )}

        <div className="hud-pills">
          <span className="pill">Level {level.id}</span>
          <span className="pill" aria-label={`${hud.shots} shots left`}>
            🎯 {hud.shots}
          </span>
          <span className="pill" aria-label={`Score ${hud.score}`}>
            ⭐ {hud.score}
          </span>
          {hud.combo >= 2 && <span className="pill hot">🔥 x{hud.combo}</span>}
        </div>

        <div className="hud-actions">
          <button onClick={togglePause} aria-label="Pause game" className="icon-btn">
            ⏸
          </button>
          <button
            onClick={toggleMusic}
            aria-label={musicOn ? "Turn music off" : "Turn music on"}
            className="icon-btn"
          >
            {musicOn ? "🎵" : "🔕"}
          </button>
          <button
            onClick={toggleSound}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            className="icon-btn"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* what the player has to do in this level */}
      <div className="objective-bar" role="status">
        {objectiveText}
      </div>

      <div className="board-frame">
        <canvas
          ref={canvasRef}
          className="board-canvas"
          width={BOARD_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={updateAim}
          onPointerDown={updateAim}
          onPointerUp={(e) => {
            updateAim(e);
            shoot();
          }}
        />

        {/* COMBO pop-up text */}
        {comboFlash && !hud.outcome && !paused && (
          <div
            key={comboFlash.id}
            aria-live="polite"
            style={{
              position: "absolute",
              left: "50%",
              top: "40%",
              pointerEvents: "none",
              fontSize: "44px",
              fontWeight: "900",
              color: "#ffd93d",
              textShadow: "0 3px 0 #b8501a, 0 0 18px rgba(255,150,0,0.8)",
              whiteSpace: "nowrap",
              animation: "comboPop 1.1s ease-out forwards",
            }}
          >
            COMBO x{comboFlash.combo}!
          </div>
        )}

        {/* PAUSED overlay */}
        {paused && !hud.outcome && (
          <div role="dialog" aria-label="Game paused" className="overlay">
            <h2>PAUSED</h2>
            <button onClick={togglePause} className="btn">
              ▶ Resume
            </button>
            <button onClick={restart} className="btn secondary">
              ↻ Restart
            </button>
            {onExit && (
              <button onClick={onExit} className="btn secondary">
                ☰ Levels
              </button>
            )}
            <p style={{ fontSize: "13px", margin: 0, opacity: 0.8 }}>
              Esc = Pause · R = Restart · Space = Shoot
              <br />1 = Bomb · 2 = Rainbow · H = Hint
            </p>
          </div>
        )}

        {/* Level complete / failed overlay */}
        {hud.outcome && (
          <div className="overlay">
            <h2 className={hud.outcome === "WON" ? "win-title" : ""}>
              {hud.outcome === "WON" ? "🎉 LEVEL COMPLETE!" : "LEVEL FAILED"}
            </h2>

            {hud.outcome === "WON" && (
              <div
                className="stars-row"
                role="img"
                aria-label={`${hud.stars} of 3 stars`}
              >
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`star${hud.stars >= n ? " on" : ""}`}
                    style={{ animationDelay: `${0.2 + n * 0.25}s` }}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {hud.outcome === "LOST" && (
              <p style={{ margin: 0, opacity: 0.9 }}>Objective incomplete: {objectiveText}</p>
            )}

            <div className="overlay-stats">
              <span className="pill">Score: {hud.score}</span>
              <span className="pill">🔥 Best Combo: x{Math.max(hud.bestCombo, 1)}</span>
            </div>

            {/* saving the verified result on the server */}
            {saving && (
              <p role="status" style={{ margin: 0 }}>
                Saving progress...
              </p>
            )}
            {saveStatus?.state === "saved" && (
              <p role="status" style={{ margin: 0 }}>
                ✅ Progress saved
              </p>
            )}
            {saveStatus?.state === "error" && (
              <div role="alert" style={{ maxWidth: "90%" }}>
                <p style={{ margin: "0 0 8px" }}>⚠️ {saveStatus.message}</p>
                {saveStatus.canRetry && onRetrySave && (
                  <button onClick={onRetrySave} className="btn secondary">
                    Try saving again
                  </button>
                )}
              </div>
            )}

            <div className="btn-row">
              {hud.outcome === "WON" && onNext && (
                <button onClick={onNext} disabled={!nextReady} className="btn">
                  Next Level ▶
                </button>
              )}
              <button onClick={restart} disabled={saving} className="btn secondary">
                {hud.outcome === "WON" ? "Replay" : "Retry"}
              </button>
              {onExit && (
                <button onClick={onExit} className="btn secondary">
                  Levels
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booster + hint bar */}
      <div className="power-bar">
        {BOOSTERS.map((b) => {
          const count = hud.boosters[b.id];
          const armed = hud.armed === b.id;
          const disabled = barDisabled || (count <= 0 && !armed);
          return (
            <button
              key={b.id}
              onClick={() => toggleBooster(b.id)}
              disabled={disabled}
              aria-pressed={armed}
              aria-label={`${b.name} booster, ${count} left. Key ${b.key}`}
              className={`power-btn${armed ? " armed" : ""}`}
            >
              <span className="power-icon" aria-hidden="true">
                {b.icon}
              </span>
              <span className="power-label">{b.name}</span>
              <span className="badge">{count}</span>
            </button>
          );
        })}

        <button
          onClick={showHint}
          disabled={barDisabled || hud.hints <= 0}
          aria-label={`Hint, ${hud.hints} left. Key H`}
          className="power-btn"
        >
          <span className="power-icon" aria-hidden="true">
            💡
          </span>
          <span className="power-label">Hint</span>
          <span className="badge">{hud.hints}</span>
        </button>
      </div>

      <p aria-live="polite" className="status-line">
        {statusLine}
      </p>
    </div>
  );
}