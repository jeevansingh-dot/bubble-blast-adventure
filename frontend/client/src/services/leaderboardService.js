

import { apiRequest } from "./api.js";

// Fetch top players and your own rank
export function fetchLeaderboard() {
  return apiRequest("GET", "/leaderboard");
}

// Fetch only your own rank and stats
export function fetchMyRank() {
  return apiRequest("GET", "/leaderboard/me");
}
