import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import GameCanvas from "../components/GameCanvas.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { LEVELS, getLevel } from "../data/levels.js";
import { isUnlocked, progressFromUser } from "../utils/progress.js";
import { startSession, completeSession } from "../services/gameService.js";

const boxStyle = { textAlign: "center", padding: "32px 12px", maxWidth: "420px" };
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

  const [session, setSession] = useState(null); // { sessionToken, seed, levelId }
  const [loadError, setLoadError] = useState("");
  const [save, setSave] = useState({ state: "idle", message: "", canRetry: false });
  const pendingRef = useRef(null); // finished game waiting to be saved
  const startedForRef = useRef(null);

  const validId = Number.isInteger(id) && id >= 1 && id <= 1000;
  const unlocked = validId && isUnlocked(id, progressFromUser(user));

  // Gets a fresh game session (also used when the player restarts the level)
  async function beginSession() {
    setSession(null);
    setLoadError("");
    setSave({ state: "idle", message: "", canRetry: false });
    pendingRef.current = null;
    try {
      const s = await startSession(id);
      setSession(s);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    if (!validId || !unlocked) return;
    // in development React runs effects twice: make sure we only start ONE session
    if (startedForRef.current === id) return;
    startedForRef.current = id;
    beginSession();
  }, [id]);

  // Called by the game when the level ends (win or lose)
  async function submit(result) {
    if (!result || !session) return;
    pendingRef.current = result;
    setSave({ state: "saving", message: "", canRetry: false });
    try {
      const data = await completeSession({
        sessionToken: session.sessionToken,
        shots: result.shots,
        claimedScore: result.score,
      });
      setUser(data.user); // the server's verified progress
      pendingRef.current = null;
      setSave({ state: "saved", message: "", canRetry: false });
    } catch (err) {
      setSave({
        state: "error",
        message: err.message,
        // only worth retrying when the server could not be reached / crashed
        canRetry: err.status === 0 || err.status >= 500,
      });
    }
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
        <button onClick={() => navigate("/levels")} style={buttonStyle}>
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
    <GameCanvas
      key={session.sessionToken}
      level={getLevel(id)}
      seed={session.seed}
      saveStatus={save}
      onFinish={submit}
      onRetrySave={() => submit(pendingRef.current)}
      onRestart={beginSession}
      onNext={hasNext ? () => navigate(`/game/${id + 1}`) : null}
      onExit={() => navigate("/levels")}
    />
  );
}