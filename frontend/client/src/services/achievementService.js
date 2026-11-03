import { apiRequest } from "./api.js";

// Returns { achievements: [...], unlocked, total }
export function fetchMyAchievements() {
  return apiRequest("/achievements/me");
}