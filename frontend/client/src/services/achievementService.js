
import { apiRequest } from "./api.js";

// Fetch all achievements
export function fetchAchievements() {
  return apiRequest("GET", "/achievements");
}

// Fetch achievements and progress for logged-in player
export function fetchMyAchievements() {
  return apiRequest("GET", "/achievements/me");
}
