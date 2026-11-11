
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Limit login and registration attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts, please try again in a few minutes",
  },
});

// Email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Dummy hash for consistent login comparison
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Generate JWT token
function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );
}

// REGISTER
// POST /api/auth/register
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({
        message: "Name must be 2 to 40 characters",
      });
    }

    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 120) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be 8 to 72 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      token: signToken(user.id),
      user: user.toPublic(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    next(err);
  }
});

// LOGIN
// POST /api/auth/login
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+passwordHash");

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.passwordHash : DUMMY_HASH
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.json({
      token: signToken(user.id),
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
});

// CURRENT USER
// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.json({
    user: req.user.toPublic(),
  });
});

// LOGOUT
// POST /api/auth/logout
router.post("/logout", requireAuth, (req, res) => {
  return res.json({
    message: "Logged out",
  });
});

export default router;
