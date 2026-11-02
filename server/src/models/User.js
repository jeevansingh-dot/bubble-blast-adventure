import mongoose from "mongoose";

// One entry per level the player has finished
const completedLevelSchema = new mongoose.Schema(
  {
    levelId: { type: Number, required: true, min: 1 },
    stars: { type: Number, min: 0, max: 3, default: 0 },
    bestScore: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

// One entry per unlocked achievement
const achievementSchema = new mongoose.Schema(
  {
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    // select:false = never returned unless we ask for it on purpose (login)
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["player", "admin"], default: "player" },

    currentLevel: { type: Number, default: 1, min: 1 },
    totalScore: { type: Number, default: 0, min: 0 },
    totalStars: { type: Number, default: 0, min: 0 },
    bubblesPopped: { type: Number, default: 0, min: 0 },
    bestCombo: { type: Number, default: 0, min: 0 },
    rescuedObjects: { type: Number, default: 0, min: 0 },
    boostersUsedTotal: { type: Number, default: 0, min: 0 },
    completedLevels: { type: [completedLevelSchema], default: [] },
    achievements: { type: [achievementSchema], default: [] },
    boosterInventory: {
      bomb: { type: Number, default: 2, min: 0 },
      rainbow: { type: Number, default: 2, min: 0 },
      extraShot: { type: Number, default: 2, min: 0 },
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// What we are allowed to send to the browser (no password hash)
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    currentLevel: this.currentLevel,
    totalScore: this.totalScore,
    totalStars: this.totalStars,
    bubblesPopped: this.bubblesPopped,
    bestCombo: this.bestCombo,
    rescuedObjects: this.rescuedObjects,
    boostersUsedTotal: this.boostersUsedTotal,
    completedLevels: this.completedLevels,
    achievements: this.achievements,
    boosterInventory: this.boosterInventory,
    createdAt: this.createdAt,
  };
};

// makes the leaderboard query fast even with many players
userSchema.index({ totalScore: -1, totalStars: -1 });

export default mongoose.model("User", userSchema);