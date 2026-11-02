import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    levelId: { type: Number, required: true, min: 1 },
    // secret id the browser must send back to finish this game
    sessionToken: { type: String, required: true, unique: true },
    // seed for the bubble queue: lets the server replay the exact same game
    seed: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "processing", "completed", "failed", "rejected", "abandoned"],
      default: "active",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // everything below is calculated by the SERVER (never taken from the browser)
    shotsUsed: { type: Number, default: 0, min: 0 },
    bubblesPopped: { type: Number, default: 0, min: 0 },
    score: { type: Number, default: 0, min: 0 },
    stars: { type: Number, default: 0, min: 0, max: 3 },
    bestCombo: { type: Number, default: 0, min: 0 },
    boostersUsed: {
      bomb: { type: Number, default: 0, min: 0 },
      rainbow: { type: Number, default: 0, min: 0 },
    },
    objective: { type: String, default: "clear_all" },
    completed: { type: Boolean, default: false },

    // anti-cheat notes
    rejectReason: { type: String },
    suspicious: { type: Boolean, default: false },
  },
  { timestamps: true }
);

gameSessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model("GameSession", gameSessionSchema);