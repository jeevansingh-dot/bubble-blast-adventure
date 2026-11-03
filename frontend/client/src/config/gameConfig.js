// Single source of truth for the game name.
// Change VITE_GAME_NAME in client/.env and rebuild - nothing else to edit.
export const GAME_NAME =
  import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";

// Accepts "https://host", "https://host/" or "https://host/api" and always
// returns ".../api", so a missing "/api" can never break the app.
function normalizeApiUrl(url) {
  const clean = url.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

export const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);