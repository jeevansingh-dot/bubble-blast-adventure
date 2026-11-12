
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import GameCanvas from "../components/GameCanvas.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { LEVELS, getLevel } from "../data/levels.js";
import { isUnlocked, progressFromUser } from "../utils/progress.js";
import { startSession, completeSession } from "../services/gameService.js";

const boxStyle = {
  textAlign: "center",
  padding: "32px 12px",
  maxWidth: "420px",
};

const buttonStyle = {
  padding: "10px 24px",
  fontSize: "18px",
  fontWeight: "bold",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  background: "#ffd93d",
  color: "#1b1b3a",
  margin: "4px",
};

export default function GamePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const id = Number(levelId);

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [save, setSave] = useState({
    state: "idle",
    message: "",
    canRetry: false,
  });
  const [badges, setBadges] = useState([]);

  const pendingRef = useRef(null);
  const startedForRef = useRef(null);
  const sessionRef = useRef(null);

  const validId =
    Number.isInteger(id) && id >= 1 && id <= LEVELS.length;

  const unlocked =
    validId && isUnlocked(id, progressFromUser(user));

  // Start a fresh session for the current level.
  async function beginSession() {
    setSession(null);
    sessionRef.current = null;

    setLoadError("");
    setBadges([]);

    setSave({
      state: "idle",
      message: "",
      canRetry: false,
    });

    pendingRef.current = null;

    try {
      const s = await startSession(id);

      sessionRef.current = s;
      setSession(s);
    } catch (err) {
      setLoadError(err.message || "Could not start level.");
    }
  }
  

  // Start a session whenever the route level changes.
  useEffect(() => {
    if (!validId || !unlocked) return;

    if (startedForRef.current === id) return;

    startedForRef.current = id;
    beginSession();

    return () => {
      sessionRef.current = null;
    };
  }, [id, validId, unlocked]);

  // Save completed game result.
  async function submit(result) {
    const activeSession = sessionRef.current;
console.log("========== GAME DEBUG ==========");
console.log("RESULT:", result);
console.log("SESSION:", sessionRef.current);
console.log("SHOTS:", result?.shots);
console.log("SHOTS IS ARRAY:", Array.isArray(result?.shots));
console.log("SCORE:", result?.score);
console.log("================================");
    if (!result || !activeSession || pendingRef.current?.saving) {
      return;
    }

    pendingRef.current = {
      ...result,
      saving: true,
    };

    setSave({
      state: "saving",
      message: "",
      canRetry: false,
    });

    try {
      const data = await completeSession({
        sessionToken: activeSession.sessionToken,
        shots: result.shots,
        claimedScore: result.score,
      });

      setUser(data.user);
      setBadges(data.newAchievements || []);

      pendingRef.current = null;

      setSave({
        state: "saved",
        message: "",
        canRetry: false,
      });
    } catch (err) {
      if (pendingRef.current) {
        pendingRef.current.saving = false;
      }

      setSave({
        state: "error",
        message: err.message || "Could not save progress.",
        canRetry: err.status === 0 || err.status >= 500,
      });
    }
  }

  // Retry saving the previous result.
  async function retrySave() {
    const pending = pendingRef.current;

    if (!pending || pending.saving) return;

    await submit({
      score: pending.score,
      shots: pending.shots,
      outcome: pending.outcome,
    });
  }

  if (!validId || !unlocked) {
    return <Navigate to="/levels" replace />;
  }

  if (loadError) {
    return (
      <div style={boxStyle} role="alert">
        <p>{loadError}</p>

        <button onClick={beginSession} style={buttonStyle}>
          Try again
        </button>

        <button
          onClick={() => navigate("/levels")}
          style={buttonStyle}
        >
          Back to levels
        </button>
      </div>
    );
  }

  if (!session || session.levelId !== id) {
    return (
      <p role="status" style={{ fontSize: "20px" }}>
        Preparing bubbles...
      </p>
    );
  }

  const hasNext = id < LEVELS.length;

  return (
    <>
      {badges.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: "100%",
            maxWidth: "440px",
            marginBottom: "12px",
            background: "#2b2a05",
            border: "2px solid #ffd93d",
            borderRadius: "14px",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <div>
            <strong>🏅 Achievement unlocked!</strong>

            {badges.map((b) => (
              <div key={b.id}>
                {b.icon} {b.name}{" "}
                <span style={{ opacity: 0.8 }}>
                  · {b.description}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setBadges([])}
            aria-label="Dismiss"
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <GameCanvas
        key={session.sessionToken}
        level={getLevel(id)}
        seed={session.seed}
        saveStatus={save}
        onFinish={submit}
        onRetrySave={retrySave}
        onRestart={beginSession}
        onNext={() => {
          if (save.state !== "saved") return;

          if (hasNext) {
            navigate(`/game/${id + 1}`);
          }
        }}
        onExit={() => navigate("/levels")}
      />
    </>
  );
}
