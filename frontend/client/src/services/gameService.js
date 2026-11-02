import { apiRequest } from "./api.js";

// Ask the server for a new game. Returns { sessionToken, seed, levelId }
export function startSession(levelId) {
  return apiRequest("/games/start", { method: "POST", body: { levelId } });
}

// Send the shots to the server. The server replays them and saves the VERIFIED result.
export function completeSession({ sessionToken, shots, claimedScore }) {
  return apiRequest("/games/complete", {
    method: "POST",
    body: { sessionToken, shots, claimedScore },
  });
}

export function fetchHistory() {
  return apiRequest("/games/history");
}