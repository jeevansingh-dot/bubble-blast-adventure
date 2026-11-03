import { useEffect, useState } from "react";
import { GAME_NAME } from "../config/gameConfig.js";
import { fetchMyAchievements } from "../services/achievementService.js";

const numberFormat = new Intl.NumberFormat("en-IN");

function Badge({ a }) {
  const percent = Math.round((a.progress / a.target) * 100);

  return (
    <li
      style={{
        listStyle: "none",
        background: a.unlocked ? "#2b2a05" : "#1b2158",
        border: a.unlocked ? "2px solid #ffd93d" : "2px solid #2a3166",
        borderRadius: "16px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          aria-hidden="true"
          style={{
            fontSize: "34px",
            filter: a.unlocked ? "none" : "grayscale(1)",
            opacity: a.unlocked ? 1 : 0.5,
          }}
        >
          {a.icon}
        </span>
        <div>
          <strong>{a.name}</strong>
          <div style={{ fontSize: "13px", opacity: 0.85 }}>{a.description}</div>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label={`${a.name} progress`}
        aria-valuemin={0}
        aria-valuemax={a.target}
        aria-valuenow={a.progress}
        style={{
          height: "10px",
          borderRadius: "999px",
          background: "#0d1233",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: a.unlocked ? "#ffd93d" : "#3d8bff",
            transition: "width 0.6s ease",
          }}
        />
      </div>

      <div style={{ fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
        <span>
          {numberFormat.format(a.progress)} / {numberFormat.format(a.target)}
        </span>
        <span>
          {a.unlocked
            ? `✅ ${new Date(a.unlockedAt).toLocaleDateString()}`
            : "🔒 Locked"}
        </span>
      </div>
    </li>
  );
}

export default function AchievementsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchMyAchievements());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "900px" }}>
      <h2 style={{ textAlign: "center", margin: "0 0 4px" }}>🏅 Achievements</h2>
      <p style={{ textAlign: "center", margin: "0 0 16px", opacity: 0.8 }}>
        {GAME_NAME}
        {data && ` · ${data.unlocked} of ${data.total} unlocked`}
      </p>

      {loading && (
        <p role="status" style={{ textAlign: "center" }}>
          Loading achievements...
        </p>
      )}

      {error && (
        <div role="alert" style={{ textAlign: "center" }}>
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

      {data && !loading && (
        <ul
          style={{
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "12px",
          }}
        >
          {data.achievements.map((a) => (
            <Badge key={a.id} a={a} />
          ))}
        </ul>
      )}
    </div>
  );
}