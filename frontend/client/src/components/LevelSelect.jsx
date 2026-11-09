import { LEVELS } from "../data/levels.js";
import { isUnlocked } from "../utils/progress.js";

const TIERS = [
  ["tutorial", "Tutorial", "🌱"],
  ["beginner", "Beginner", "🫧"],
  ["easy", "Easy", "🎯"],
  ["medium", "Medium", "⚡"],
  ["hard", "Hard", "🔥"],
  ["expert", "Expert", "👑"],
];

export default function LevelSelect({ progress, onSelect }) {
  const starsOf = (id) => progress.stars[id] || 0;

  const completed = LEVELS.filter((l) => starsOf(l.id) > 0).length;
  const totalStars = LEVELS.reduce((sum, l) => sum + starsOf(l.id), 0);
  const maxStars = LEVELS.length * 3;
  const percent = Math.round((completed / LEVELS.length) * 100);

  const currentId = LEVELS.find(
    (l) => isUnlocked(l.id, progress) && starsOf(l.id) === 0
  )?.id;

  return (
    <div className="level-map">
      <header className="level-map-header">
        <h2>Level Map</h2>
        <p>
          {completed} / {LEVELS.length} completed · ⭐ {totalStars} / {maxStars}
        </p>
      </header>

      <div
        role="progressbar"
        aria-label="Levels completed"
        aria-valuemin={0}
        aria-valuemax={LEVELS.length}
        aria-valuenow={completed}
        className="level-progress"
      >
        <div className="level-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {TIERS.map(([key, label, emoji]) => {
        const levels = LEVELS.filter((l) => l.difficulty === key);
        if (levels.length === 0) return null;

        return (
          <section key={key} className="tier-card" aria-labelledby={`tier-${key}`}>
            <h3 id={`tier-${key}`} className="tier-title">
              <span>
                {emoji} {label}
              </span>
              <span>
                Levels {levels[0].id}–{levels[levels.length - 1].id}
              </span>
            </h3>

            <div className="level-grid">
              {levels.map((l) => {
                const unlocked = isUnlocked(l.id, progress);
                const stars = starsOf(l.id);
                const classes = [
                  "level-node",
                  !unlocked && "locked",
                  stars > 0 && "done",
                  l.id === currentId && "current",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={l.id}
                    className={classes}
                    disabled={!unlocked}
                    onClick={() => onSelect(l.id)}
                    aria-label={
                      unlocked
                        ? `Level ${l.id}, ${stars} of 3 stars${
                            l.id === currentId ? ", play next" : ""
                          }`
                        : `Level ${l.id}, locked`
                    }
                  >
                    <span className="level-num">
                      {unlocked ? l.id : "🔒"}
                    </span>
                    <span className="level-stars" aria-hidden="true">
                      {unlocked
                        ? [1, 2, 3].map((n) => (n <= stars ? "★" : "☆")).join("")
                        : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}