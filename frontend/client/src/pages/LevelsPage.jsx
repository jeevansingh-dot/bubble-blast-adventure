
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  isUnlocked,
  progressFromUser,
} from "../utils/progress.js";

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const levelCategories = [
    { title: "Tutorial Zone", range: "Levels 1–5", icon: "🌱", start: 1, end: 5 },
    { title: "Beginner Coast", range: "Levels 6–10", icon: "🫧", start: 6, end: 10 },
    { title: "Easy Valley", range: "Levels 11–20", icon: "🎯", start: 11, end: 20 },
    { title: "Medium Peaks", range: "Levels 21–30", icon: "⚡", start: 21, end: 30 },
    { title: "Hard Volcano", range: "Levels 31–35", icon: "🔥", start: 31, end: 35 },
    { title: "Expert Domain", range: "Levels 36–40", icon: "👑", start: 36, end: 40 },
  ];

  // Read progress from the logged-in user's server data
  const progress = progressFromUser(user);
  const stars = progress.stars || {};

  // Count only actually completed levels
  const completedLevels = Object.values(stars).filter(
    (value) => Number(value) > 0
  ).length;

  // Calculate total earned stars
  const totalStars = Object.values(stars).reduce(
    (total, value) => total + Number(value || 0),
    0
  );

  const totalLevels = 40;
  const progressPercent = Math.min(
    100,
    (completedLevels / totalLevels) * 100
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dashboard Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(30,41,59,.8), rgba(15,23,42,.95))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "24px",
          padding: "24px 32px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,.4)",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "900",
              letterSpacing: "1px",
              color: "#fff",
            }}
          >
            LEVEL <span style={{ color: "#06b6d4" }}>MAP</span>
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Pop bubbles, hit high scores & unlock stage rewards!
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            background: "rgba(9,13,22,.8)",
            border: "1px solid rgba(255,255,255,.1)",
            padding: "12px 24px",
            borderRadius: "16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
                display: "block",
              }}
            >
              PROGRESS
            </span>

            <span
              style={{
                fontSize: "20px",
                fontWeight: "900",
                color: "#38bdf8",
              }}
            >
              {completedLevels}
              <span style={{ fontSize: "14px", color: "#64748b" }}>
                {" "}/ {totalLevels}
              </span>
            </span>
          </div>

          <div
            style={{
              width: "1px",
              height: "32px",
              background: "rgba(255,255,255,.1)",
            }}
          />

          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
                display: "block",
              }}
            >
              STARS
            </span>

            <span
              style={{
                fontSize: "20px",
                fontWeight: "900",
                color: "#fbbf24",
              }}
            >
              ⭐ {totalStars}
              <span style={{ fontSize: "14px", color: "#64748b" }}>
                {" "}/ 120
              </span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              height: "9px",
              background: "rgba(255,255,255,.1)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
                borderRadius: "20px",
                transition: "width .4s ease",
              }}
            />
          </div>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "11px",
              textAlign: "right",
              margin: "6px 0 0",
            }}
          >
            {Math.round(progressPercent)}% completed
          </p>
        </div>
      </div>

      {/* Level Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {levelCategories.map((cat, idx) => {
          const categoryCompleted = Array.from(
            { length: cat.end - cat.start + 1 },
            (_, i) => cat.start + i
          ).filter((level) => Number(stars[level] || 0) > 0).length;

          return (
            <div
              key={cat.title}
              style={{
                background: "rgba(15,23,42,.65)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "20px",
                padding: "20px 24px",
                boxShadow: "0 10px 30px rgba(0,0,0,.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255,255,255,.08)",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "26px" }}>{cat.icon}</span>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#f8fafc",
                      }}
                    >
                      {cat.title}
                    </h2>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#38bdf8",
                        fontWeight: "600",
                      }}
                    >
                      {cat.range}
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    background: "rgba(99,102,241,.15)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99,102,241,.3)",
                  }}
                >
                  Stage {idx + 1} · {categoryCompleted}/
                  {cat.end - cat.start + 1}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill,minmax(85px,1fr))",
                  gap: "16px",
                }}
              >
                {Array.from(
                  { length: cat.end - cat.start + 1 },
                  (_, i) => cat.start + i
                ).map((levelNum) => {
                  const unlocked = isUnlocked(levelNum, progress);
                  const earnedStars = Number(stars[levelNum] || 0);
                  const completed = earnedStars > 0;

                  return (
                    <button
                      key={levelNum}
                      onClick={() => {
                        if (unlocked) {
                          navigate(`/game/${levelNum}`);
                        }
                      }}
                      disabled={!unlocked}
                      title={
                        completed
                          ? `Level ${levelNum} completed`
                          : unlocked
                          ? `Play Level ${levelNum}`
                          : "Complete the previous level to unlock"
                      }
                      style={{
                        position: "relative",
                        height: "95px",
                        borderRadius: "18px",
                        border: unlocked
                          ? "2px solid rgba(56,189,248,.5)"
                          : "1px solid rgba(255,255,255,.05)",
                        background: unlocked
                          ? completed
                            ? "linear-gradient(145deg,#1e1b4b,#312e81)"
                            : "linear-gradient(145deg,#0284c7,#0369a1)"
                          : "rgba(15,23,42,.4)",
                        boxShadow: unlocked
                          ? "0 8px 20px rgba(3,105,161,.4)"
                          : "none",
                        cursor: unlocked ? "pointer" : "not-allowed",
                        opacity: unlocked ? 1 : 0.45,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .2s ease",
                        outline: "none",
                        padding: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: "900",
                          color: unlocked ? "#fff" : "#64748b",
                        }}
                      >
                        {levelNum}
                      </span>

                      <div style={{ marginTop: "6px", fontSize: "11px" }}>
                        {unlocked ? (
                          <span style={{ color: "#fbbf24" }}>
                            {"⭐".repeat(earnedStars)}
                            {"☆".repeat(Math.max(0, 3 - earnedStars))}
                          </span>
                        ) : (
                          <span>🔒</span>
                        )}
                      </div>

                      {completed && (
                        <span
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "7px",
                            fontSize: "10px",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
