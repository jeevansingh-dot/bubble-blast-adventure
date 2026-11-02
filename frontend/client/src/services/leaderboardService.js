import { apiRequest } from "./api.js";

// Returns { leaderboard: [...], you: { rank, score, stars, ... } }
export function fetchLeaderboard() {
  return apiRequest("/leaderboard");
}