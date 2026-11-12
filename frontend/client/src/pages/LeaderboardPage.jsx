
import { useEffect, useState } from "react";
import { GAME_NAME } from "../config/gameConfig.js";
import { fetchLeaderboard } from "../services/leaderboardService.js";

const MEDALS = ["🥇", "🥈", "🥉"];
const numberFormat = new Intl.NumberFormat("en-IN");

function rankLabel(rank) {
  return MEDALS[rank - 1] || `#${rank}`;
}

function PlayerCard({ row, highlight = false }) {
  const rankClass =
    row.rank === 1 ? "gold" :
    row.rank === 2 ? "silver" :
    row.rank === 3 ? "bronze" : "";

  return (
    <div className={`lb-player ${rankClass} ${highlight ? "lb-you" : ""}`}>
      <div className="lb-medal">{rankLabel(row.rank)}</div>

      <div className="lb-player-info">
        <div className="lb-player-name">
          {row.name}
          {highlight && <span className="lb-you-tag">YOU</span>}
        </div>

        <div className="lb-player-stats">
          <span>⭐ {row.stars}</span>
          <span>🎮 {row.levelsCompleted} levels</span>
          <span>🔥 x{row.bestCombo}</span>
        </div>
      </div>

      <div className="lb-score">
        {numberFormat.format(row.score)}
        <small>POINTS</small>
      </div>
    </div>
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
      setError(err.message || "Unable to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const you = data?.you;
  const leaderboard = data?.leaderboard || [];

  const youInList = leaderboard.some((row) => row.isYou);

  const topThree = leaderboard
    .filter((row) => row.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  const podiumOrder = [
    topThree.find((row) => row.rank === 2),
    topThree.find((row) => row.rank === 1),
    topThree.find((row) => row.rank === 3),
  ];

  const remainingPlayers = leaderboard.filter(
    (row) => row.rank > 3
  );

  return (
    <div className="lb-page">
      <style>{`
        .lb-page {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          padding: 18px 12px 35px;
          color: #f5f7ff;
          font-family: Inter, system-ui, sans-serif;
          box-sizing: border-box;
          position: relative;
          isolation: isolate;
        }

        .lb-page * {
          box-sizing: border-box;
        }

        .lb-page::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(92, 74, 255, .19), transparent 70%);
          filter: blur(18px);
          z-index: -1;
          pointer-events: none;
        }

        .lb-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .lb-trophy {
          font-size: 38px;
          display: block;
          filter: drop-shadow(0 0 13px rgba(255, 196, 54, .6));
          animation: lbFloat 2.5s ease-in-out infinite;
        }

        .lb-title {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: .5px;
          margin: 7px 0 4px;
          background: linear-gradient(90deg, #fff, #b7baff, #fff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .lb-subtitle {
          color: #9da7ca;
          font-size: 11px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .lb-rank-card {
          position: relative;
          overflow: hidden;
          padding: 18px;
          border-radius: 18px;
          margin-bottom: 27px;
          text-align: center;
          background: linear-gradient(120deg, #373b91, #5536a4, #292e71);
          border: 1px solid rgba(169, 157, 255, .4);
          box-shadow: 0 10px 30px rgba(53, 49, 153, .28);
        }

        .lb-rank-card::before {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: -55px;
          top: -80px;
          border-radius: 50%;
          background: rgba(255,255,255,.12);
        }

        .lb-rank-label {
          color: #d8d9ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .lb-rank-number {
          font-size: 33px;
          font-weight: 950;
          margin: 3px 0;
          text-shadow: 0 3px 15px rgba(0,0,0,.2);
        }

        .lb-rank-points {
          color: #e5e5ff;
          font-size: 13px;
        }

        .lb-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 2px 13px;
        }

        .lb-section-heading h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 850;
        }

        .lb-section-heading span {
          color: #828cac;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .lb-podium {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: end;
          gap: 8px;
          margin-bottom: 27px;
        }

        .lb-podium-card {
          min-width: 0;
          text-align: center;
          padding: 12px 5px 13px;
          border-radius: 15px;
          background: linear-gradient(180deg, #252c55, #171d39);
          border: 1px solid rgba(139, 151, 255, .16);
          animation: lbAppear .5s ease both;
        }

        .lb-podium-card.first {
          padding-top: 19px;
          padding-bottom: 21px;
          background: linear-gradient(180deg, #51421b, #29233b);
          border-color: rgba(255, 208, 71, .65);
          box-shadow: 0 0 22px rgba(255, 191, 49, .12);
        }

        .lb-podium-card.second {
          min-height: 130px;
        }

        .lb-podium-card.third {
          min-height: 120px;
        }

        .lb-podium-medal {
          font-size: 29px;
          margin-bottom: 7px;
        }

        .lb-podium-name {
          font-size: 11px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lb-podium-score {
          margin-top: 7px;
          font-size: 13px;
          font-weight: 900;
          color: #ffe18b;
        }

        .lb-podium-rank {
          font-size: 9px;
          color: #aab3d5;
          margin-top: 4px;
        }

        .lb-player-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .lb-player {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          padding: 12px;
          min-width: 0;
          border-radius: 14px;
          background: linear-gradient(110deg, #202951, #171d39);
          border: 1px solid rgba(133, 148, 255, .12);
          transition: transform .2s, border-color .2s;
          animation: lbAppear .4s ease both;
        }

        .lb-player:hover {
          transform: translateY(-2px);
          border-color: rgba(145, 154, 255, .5);
        }

        .lb-player.gold {
          border-color: rgba(255, 211, 75, .3);
        }

        .lb-player.silver {
          border-color: rgba(198, 214, 255, .2);
        }

        .lb-player.bronze {
          border-color: rgba(227, 153, 96, .2);
        }

        .lb-player.lb-you {
          background: linear-gradient(110deg, #3b3512, #282449);
          border: 1px solid #ffdb4d;
          box-shadow: 0 0 18px rgba(255, 213, 61, .12);
        }

        .lb-medal {
          font-size: 22px;
          text-align: center;
        }

        .lb-player-info {
          min-width: 0;
        }

        .lb-player-name {
          font-size: 12px;
          font-weight: 850;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lb-you-tag {
          display: inline-block;
          margin-left: 6px;
          color: #ffe16b;
          font-size: 8px;
          letter-spacing: .8px;
        }

        .lb-player-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 5px;
          color: #b8c1df;
          font-size: 9px;
        }

        .lb-score {
          text-align: right;
          font-size: 15px;
          font-weight: 950;
          white-space: nowrap;
        }

        .lb-score small {
          display: block;
          margin-top: 3px;
          color: #8994b8;
          font-size: 8px;
          letter-spacing: .8px;
        }

        .lb-empty, .lb-loading, .lb-error {
          text-align: center;
          padding: 28px 12px;
          border-radius: 16px;
          background: #171e3b;
          color: #aeb9da;
          font-size: 13px;
        }

        .lb-retry {
          margin-top: 12px;
          padding: 10px 22px;
          border: 0;
          border-radius: 30px;
          background: linear-gradient(90deg, #ffdb52, #ff9f43);
          color: #201a35;
          font-weight: 900;
          cursor: pointer;
        }

        .lb-footer {
          text-align: center;
          margin-top: 24px;
          color: #727eaa;
          font-size: 10px;
          letter-spacing: 1px;
        }

        @keyframes lbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes lbAppear {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 360px) {
          .lb-page { padding-left: 8px; padding-right: 8px; }
          .lb-player { grid-template-columns: 34px minmax(0, 1fr) auto; gap: 6px; padding: 10px 8px; }
          .lb-player-stats { gap: 5px; font-size: 8px; }
          .lb-podium-name { font-size: 10px; }
        }
      `}</style>

      <header className="lb-header">
        <span className="lb-trophy">🏆</span>
        <h2 className="lb-title">LEADERBOARD</h2>
        <div className="lb-subtitle">
          {GAME_NAME} · Global Ranking
        </div>
      </header>

      {loading && (
        <div className="lb-loading" role="status">
          ✨ Loading global players...
        </div>
      )}

      {error && (
        <div className="lb-error" role="alert">
          {error}
          <br />
          <button className="lb-retry" onClick={load}>
            Try Again ↻
          </button>
        </div>
      )}

      {data && !loading && (
        <>
          <section className="lb-rank-card">
            <div className="lb-rank-label">Your Global Position</div>

            {you?.rank ? (
              <>
                <div className="lb-rank-number">#{you.rank}</div>
                <div className="lb-rank-points">
                  {numberFormat.format(you.score)} points
                  &nbsp; · &nbsp;⭐ {you.stars} Stars
                </div>
              </>
            ) : (
              <div className="lb-rank-points" style={{ marginTop: 12 }}>
                Complete a level to enter the leaderboard!
              </div>
            )}
          </section>

          {leaderboard.length === 0 ? (
            <div className="lb-empty">
              <div style={{ fontSize: 35 }}>🎮</div>
              <strong>No players yet!</strong>
              <p>Be the first champion on the leaderboard.</p>
            </div>
          ) : (
            <>
              {topThree.length > 0 && (
                <>
                  <div className="lb-section-heading">
                    <h3>👑 Top Champions</h3>
                    <span>HALL OF FAME</span>
                  </div>

                  <div className="lb-podium">
                    {podiumOrder.map((row, index) => {
                      if (!row) {
                        return <div key={`empty-${index}`} />;
                      }

                      const positionClass =
                        row.rank === 1 ? "first" :
                        row.rank === 2 ? "second" : "third";

                      return (
                        <div
                          key={row.rank}
                          className={`lb-podium-card ${positionClass}`}
                        >
                          <div className="lb-podium-medal">
                            {rankLabel(row.rank)}
                          </div>
                          <div className="lb-podium-name">
                            {row.name}
                            {row.isYou ? " (You)" : ""}
                          </div>
                          <div className="lb-podium-score">
                            {numberFormat.format(row.score)}
                          </div>
                          <div className="lb-podium-rank">
                            RANK #{row.rank}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="lb-section-heading">
                <h3>🎯 All Players</h3>
                <span>{leaderboard.length} PLAYERS</span>
              </div>

              <ol className="lb-player-list">
                {remainingPlayers.map((row) => (
                  <li key={row.rank}>
                    <PlayerCard row={row} highlight={row.isYou} />
                  </li>
                ))}

                {you?.rank && !youInList && (
                  <li>
                    <PlayerCard
                      row={{ ...you, rank: you.rank }}
                      highlight
                    />
                  </li>
                )}
              </ol>
            </>
          )}

          <div className="lb-footer">
            ✦ PLAY · COMPETE · BECOME A CHAMPION ✦
          </div>
        </>
      )}
    </div>
  );
}
