
import { apiRequest } from "./api.js";

// Start a new game session
export const startSession = async (level = 1) => {
  const numericLevel =
    typeof level === "object"
      ? Number(level.level || level.id || 1)
      : Number(level) || 1;

  return apiRequest("POST", "/games/start", {
    levelId: numericLevel,
  });
};

// Backward-compatible alias
export const startGameSession = async (level = 1) => {
  return startSession(level);
};

// Submit completed game for server-side verification
// Backend expects: { sessionToken, shots, claimedScore }
export const completeSession = async ({
  sessionToken,
  shots,
  claimedScore,
}) => {
  return apiRequest("POST", "/games/complete", {
    sessionToken,
    shots,
    claimedScore,
  });
};

// Fetch game history
export const getGameHistory = async () => {
  return apiRequest("GET", "/games/history");
};

// Fetch leaderboard
export const getLeaderboard = async () => {
  return apiRequest("GET", "/leaderboard");
};
