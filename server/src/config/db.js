import mongoose from "mongoose";

// Connects to MongoDB using MONGODB_URI from server/.env
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in server/.env");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}