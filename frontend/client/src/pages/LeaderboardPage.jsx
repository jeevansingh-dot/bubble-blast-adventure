import { useEffect, useState } from "react";
import { GAME_NAME } from "../config/gameConfig.js";
import { fetchLeaderboard } from "../services/leaderboardService.js";

const MEDALS = ["🥇", "🥈", "🥉"];
const rankLabel = (rank) => MEDALS[rank - 1] || `#${rank}`;

const numberFormat = new Intl.NumberFormat("en-IN");

function Row({ row, highlight }) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr auto",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: highlight ? "#3b3a00" : "#1b2158",
        border: highlight ? "2px solid #ffd93d" : "2px solid transparent",
      }}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>{rankLabel(row.rank)}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <strong>{row.name}</strong>
        {highlight && " (you)"}
        <span style={{ display: "block", fontSize: "13px", opacity: 0.8 }}>
          ⭐ {row.stars} · 🏁 {row.levelsCompleted} levels · 🔥 x{row.bestCombo}
        </span>
      </span>
      <strong style={{ fontSize: "18px" }}>{numberFormat.format(row.score)}</strong>
    </li>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchLeaderboard());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const you = data?.you;
  // your row is shown at the bottom only when you are not already in the top 50
  const youInList = data?.leaderboard.some((r) => r.isYou);

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <h2 style={{ textAlign: "center", margin: "0 0 4px" }}>🏆 Leaderboard</h2>
      <p style={{ textAlign: "center", margin: "0 0 16px", opacity: 0.8 }}>
        {GAME_NAME} · Global ranking
      </p>

      {loading && <p role="status">Loading leaderboard...</p>}

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
        <>
          <div
            style={{
              background: "#2a3166",
              borderRadius: "14px",
              padding: "12px 16px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {you.rank ? (
              <>
                <strong style={{ fontSize: "20px" }}>Your Rank: #{you.rank}</strong>
                <div>
                  {numberFormat.format(you.score)} points · ⭐ {you.stars}
                </div>
              </>
            ) : (
              <strong>Complete a level to get on the leaderboard!</strong>
            )}
          </div>

          {data.leaderboard.length === 0 ? (
            <p style={{ textAlign: "center" }}>No players on the board yet. Be the first!</p>
          ) : (
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {data.leaderboard.map((row) => (
                <Row key={row.rank} row={row} highlight={row.isYou} />
              ))}
              {you.rank && !youInList && (
                <Row row={{ ...you, rank: you.rank }} highlight />
              )}
            </ol>
          )}
        </>
      )}
    </div>
  );
}