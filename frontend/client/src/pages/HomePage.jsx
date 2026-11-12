
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { progressFromUser } from "../utils/progress.js";

const worlds = [
  {
    icon: "🌳",
    name: "Emerald Forest",
    levels: "01 — 10",
    tone: "forest",
    note: "The adventure begins",
  },
  {
    icon: "❄️",
    name: "Frosty Peaks",
    levels: "11 — 20",
    tone: "ice",
    note: "Chill bubbles await",
  },
  {
    icon: "🌋",
    name: "Lava Kingdom",
    levels: "21 — 30",
    tone: "lava",
    note: "A hotter challenge",
  },
  {
    icon: "🚀",
    name: "Cosmic Galaxy",
    levels: "31 — 40",
    tone: "space",
    note: "The final frontier",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const progress = progressFromUser(user);

  const completed = Object.values(progress.stars).filter(
    (n) => Number(n) > 0
  ).length;

  const stars = Object.values(progress.stars).reduce(
    (sum, n) => sum + Number(n || 0),
    0
  );

  const nextLevel = Math.min(40, completed + 1);

  const play = () => {
    navigate(user ? `/game/${nextLevel}` : "/register");
  };

  const explore = () => {
    navigate(user ? "/levels" : "/login");
  };

  return (
    <div className="home-shell">
      <section className="hero-stage">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            THE BUBBLY ADVENTURE STARTS HERE
          </div>

          <h1>
            POP YOUR WAY
            <br />
            <span>TO THE TOP!</span>
          </h1>

          <p className="hero-lede">
            Aim, match and blast your way through magical worlds.
            Can you rescue every little bubble buddy?
          </p>

          <div className="hero-actions">
            <button
              className="game-button game-button-primary"
              onClick={play}
            >
              <span>▶</span>
              {user ? "CONTINUE ADVENTURE" : "PLAY NOW"}
            </button>

            <button
              className="game-button game-button-ghost"
              onClick={explore}
            >
              EXPLORE WORLDS
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>40</strong>
              <span>LEVELS</span>
            </div>

            <div>
              <strong>4</strong>
              <span>MAGICAL WORLDS</span>
            </div>

            <div>
              <strong>★ {stars}</strong>
              <span>YOUR STARS</span>
            </div>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Colorful bubble adventure illustration"
        >
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />

          <div className="art-cloud cloud-one" />
          <div className="art-cloud cloud-two" />

          <div className="art-island">
            <div className="island-tree tree-one">🌴</div>
            <div className="island-tree tree-two">🌳</div>
            <div className="island-rock">🪨</div>
            <div className="island-ground" />
            <div className="island-water" />
          </div>

          <div className="mascot-orb">
            <span>🐥</span>
            <i />
          </div>

          <div className="hero-bubble bubble-a">🔵</div>
          <div className="hero-bubble bubble-b">🟣</div>
          <div className="hero-bubble bubble-c">🟡</div>
          <div className="hero-bubble bubble-d">🟢</div>

          <div className="art-spark spark-a">✦</div>
          <div className="art-spark spark-b">✧</div>

          <div className="art-label">
            <span>✨</span> WORLD 1: FOREST
          </div>
        </div>
      </section>

      {user && (
        <section className="player-strip">
          <div className="player-welcome">
            <div className="player-avatar">🎮</div>

            <div>
              <span>WELCOME BACK</span>
              <strong>
                {user.username || user.name || "Player"}
              </strong>
            </div>
          </div>

          <div className="player-progress">
            <div className="progress-label">
              <span>Adventure progress</span>
              <strong>{completed}/40 levels</strong>
            </div>

            <div className="progress-track">
              <i
                style={{
                  width: `${(completed / 40) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            className="text-action"
            onClick={() => navigate("/dashboard")}
          >
            MY DASHBOARD ↗
          </button>
        </section>
      )}

      <section className="world-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              CHOOSE YOUR DESTINATION
            </span>
            <h2>EXPLORE THE WORLDS</h2>
          </div>

          <button
            className="text-action"
            onClick={explore}
          >
            VIEW ALL LEVELS ↗
          </button>
        </div>

        <div className="world-grid">
          {worlds.map((world, index) => (
            <button
              className={`world-card world-${world.tone}`}
              key={world.name}
              onClick={explore}
            >
              <span className="world-number">
                WORLD 0{index + 1}
              </span>

              <span className="world-emoji">
                {world.icon}
              </span>

              <strong>{world.name}</strong>

              <span className="world-note">
                {world.note}
              </span>

              <span className="world-levels">
                {world.levels} <b>→</b>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="feature-ribbon">
        <div>
          <span>💥</span>
          <strong>EPIC COMBOS</strong>
          <small>Chain pops for big scores</small>
        </div>

        <div>
          <span>🧨</span>
          <strong>POWER BOOSTERS</strong>
          <small>Blast through tricky boards</small>
        </div>

        <div>
          <span>🏆</span>
          <strong>COLLECT STARS</strong>
          <small>Master every level</small>
        </div>

        <div>
          <span>🐣</span>
          <strong>RESCUE BUDDIES</strong>
          <small>Little friends need you</small>
        </div>
      </section>

      <footer className="game-footer">
        BUBBLE BLAST ADVENTURE
        <span>•</span>
        POP. PLAY. REPEAT.
      </footer>
    </div>
  );
}
