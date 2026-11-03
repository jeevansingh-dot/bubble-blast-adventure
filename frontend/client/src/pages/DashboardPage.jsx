import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchHistory } from "../services/gameService.js";

const numberFormat = new Intl.NumberFormat("en-IN");
const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Stat({ icon, label, value }) {
  return (
    <div
      style={{
        background: "#1b2158",
        borderRadius: "14px",
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: "24px" }}>
        {icon}
      </div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "13px", opacity: 0.8 }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHistory();
      setHistory(data.history);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const linkButton = {
    display: "inline-block",
    padding: "10px 22px",
    fontSize: "17px",
    fontWeight: "bold",
    borderRadius: "999px",
    background: "#ffd93d",
    color: "#1b1b3a",
    textDecoration: "none",
  };

  return (
    <div style={{ width: "100%", maxWidth: "760px" }}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <p style={{ margin: 0, opacity: 0.8 }}>{GAME_NAME}</p>
        <h2 style={{ margin: "4px 0" }}>{user.name}</h2>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          LEVEL {user.currentLevel} · ⭐ {user.totalStars} Stars
        </div>
        <div style={{ marginTop: "12px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={`/game/${user.currentLevel}`} style={linkButton}>
            ▶ Continue: Level {user.currentLevel}
          </Link>
          <Link to="/levels" style={linkButton}>
            All Levels
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <Stat icon="🏁" label="Levels Completed" value={user.completedLevels.length} />
        <Stat icon="🏆" label="Total Score" value={numberFormat.format(user.totalScore)} />
        <Stat icon="⭐" label="Total Stars" value={user.totalStars} />
        <Stat icon="🔥" label="Best Combo" value={`x${user.bestCombo}`} />
        <Stat icon="🫧" label="Bubbles Popped" value={numberFormat.format(user.bubblesPopped)} />
        <Stat icon="🦕" label="Rescues" value={user.rescuedObjects} />
        <Stat icon="🏅" label="Achievements" value={user.achievements.length} />
      </div>

      <h3 style={{ marginBottom: "8px" }}>Game History</h3>

      {loading && <p role="status">Loading game history...</p>}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button
            onClick={load}
            style={{
              padding: "8px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background: "#ffd93d",
            }}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <p>No games yet. Play a level and it will show up here!</p>
      )}

      {history.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {history.map((g) => (
            <li
              key={g.id}
              style={{
                background: "#1b2158",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "6px 16px",
              }}
            >
              <strong>Level {g.levelId}</strong>
              <span>Score: {numberFormat.format(g.score)}</span>
              <span>{g.completed ? `${"★".repeat(g.stars)}${"☆".repeat(3 - g.stars)}` : "Failed"}</span>
              <span>Shots: {g.shotsUsed}</span>
              <span>Combo: x{g.bestCombo}</span>
              <span>{g.completed ? "✅ Completed" : "❌ Not completed"}</span>
              <span style={{ opacity: 0.8 }}>{formatDate(g.startedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}