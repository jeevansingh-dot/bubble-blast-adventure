import jwt from "jsonwebtoken";
import User from "../models/User.js";

const TOKEN_ERRORS = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];

// Put this before any route that needs a logged-in player.
// It reads "Authorization: Bearer <token>", checks it and sets req.user.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Please log in to continue" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Account not found, please log in again" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (TOKEN_ERRORS.includes(err.name)) {
      const expired = err.name === "TokenExpiredError";
      return res.status(401).json({
        message: expired
          ? "Your session expired, please log in again"
          : "Invalid session, please log in again",
      });
    }
    next(err); // a real server/database problem
  }
}

// For admin-only routes (used later). Must come AFTER requireAuth.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}