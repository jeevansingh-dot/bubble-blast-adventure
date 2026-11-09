
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMe } from "../services/authService.js";

const StatCard = ({ icon, label, value }) => (
  <div className="profile-stat">
    <span className="profile-stat-icon">{icon}</span>
    <span className="profile-stat-value">{value ?? 0}</span>
    <span className="profile-stat-label">{label}</span>
  </div>
);

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchMe()
      .then((freshUser) => {
        if (active) setUser(freshUser);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setUser]);

  if (loading) {
    return <p role="status">Loading your profile...</p>;
  }

  if (error && !user) {
    return <p role="alert">{error}</p>;
  }

  if (!user) {
    return <p>Player information not available.</p>;
  }

  const completedLevels = user.completedLevels || [];
  const achievements = user.achievements || [];
  const boosters = user.boosterInventory || {};

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase() || "P"}
        </div>

        <div>
          <span className="profile-eyebrow">PLAYER PROFILE</span>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <small>Joined {joinedDate}</small>
        </div>
      </div>

      <div className="profile-section">
        <h2>🏆 Your Game Statistics</h2>

        <div className="profile-stats-grid">
          <StatCard icon="🎮" label="Current Level" value={user.currentLevel} />
          <StatCard icon="⭐" label="Total Stars" value={user.totalStars} />
          <StatCard icon="💎" label="Total Score" value={(user.totalScore || 0).toLocaleString("en-IN")} />
          <StatCard icon="🫧" label="Bubbles Popped" value={user.bubblesPopped} />
          <StatCard icon="🔥" label="Best Combo" value={`x${user.bestCombo || 0}`} />
          <StatCard icon="🐣" label="Rescued Objects" value={user.rescuedObjects} />
          <StatCard icon="🏅" label="Levels Completed" value={completedLevels.length} />
          <StatCard icon="🎁" label="Boosters Used" value={user.boostersUsedTotal} />
        </div>
      </div>

      <div className="profile-section">
        <h2>🎁 Booster Inventory</h2>

        <div className="profile-inventory">
          <div>💣 Bomb <strong>{boosters.bomb ?? 0}</strong></div>
          <div>🌈 Rainbow <strong>{boosters.rainbow ?? 0}</strong></div>
          <div>➕ Extra Shot <strong>{boosters.extraShot ?? 0}</strong></div>
        </div>
      </div>

      <div className="profile-section">
        <h2>🏅 Achievements ({achievements.length})</h2>

        {achievements.length > 0 ? (
          <div className="profile-achievements">
            {achievements.map((achievement) => (
              <div
                className="profile-achievement"
                key={achievement.achievementId}
              >
                <span>🏆</span>
                <div>
                  <strong>{achievement.achievementId}</strong>
                  <small>
                    Unlocked{" "}
                    {achievement.unlockedAt
                      ? new Date(achievement.unlockedAt).toLocaleDateString()
                      : "Recently"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty">
            No achievements unlocked yet. Keep playing!
          </p>
        )}
      </div>

      <div className="profile-section">
        <h2>🌟 Completed Levels</h2>

        {completedLevels.length > 0 ? (
          <div className="profile-levels">
            {completedLevels
              .slice()
              .sort((a, b) => a.levelId - b.levelId)
              .map((level) => (
                <div className="profile-level" key={level.levelId}>
                  <strong>Level {level.levelId}</strong>
                  <span>{"⭐".repeat(level.stars || 0)}</span>
                  <small>
                    Score: {(level.bestScore || 0).toLocaleString("en-IN")}
                  </small>
                </div>
              ))}
          </div>
        ) : (
          <p className="profile-empty">
            Complete your first level to see your progress here.
          </p>
        )}
      </div>
    </section>
  );
}
