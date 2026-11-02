import { LEVELS } from "../data/levels.js";
import { isUnlocked } from "../utils/progress.js";

// 3 stars row, e.g. 2 stars -> "★★☆"
const starsText = (n) => [1, 2, 3].map((i) => (n >= i ? "★" : "☆")).join("");

export default function LevelSelect({ progress, onSelect }) {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <h2 style={{ textAlign: "center", marginTop: 0 }}>Select Level</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: "12px",
        }}
      >
        {LEVELS.map((level) => {
          const unlocked = isUnlocked(level.id, progress);
          const stars = progress.stars[level.id] || 0;

          return (
            <button
              key={level.id}
              disabled={!unlocked}
              onClick={() => onSelect(level.id)}
              aria-label={
                unlocked ? `Level ${level.id}, ${stars} stars` : `Level ${level.id} locked`
              }
              style={{
                padding: "14px 8px",
                borderRadius: "16px",
                border: "none",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: unlocked ? "pointer" : "not-allowed",
                color: unlocked ? "#1b1b3a" : "#9aa0c8",
                background: unlocked ? "#ffd93d" : "#2a3166",
                opacity: unlocked ? 1 : 0.7,
              }}
            >
              <div>{unlocked ? `Level ${level.id}` : `🔒 ${level.id}`}</div>
              <div style={{ fontSize: "18px", minHeight: "24px" }}>
                {unlocked ? starsText(stars) : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}