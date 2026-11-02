import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Max 30 register/login attempts per IP every 15 minutes (stops password guessing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in a few minutes" },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Used when the email does not exist, so login takes the same time either way
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    // only plain strings are allowed (blocks tricks like {"$gt": ""})
    if (![name, email, password, confirmPassword].every((v) => typeof v === "string")) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({ message: "Name must be 2 to 40 characters" });
    }
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 120) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be 8 to 72 characters" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (await User.findOne({ email: cleanEmail })) {
      return res.status(409).json({ message: "This email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    res.status(201).json({ token: signToken(user.id), user: user.toPublic() });
  } catch (err) {
    if (err.code === 11000) {
      // two people registered the same email at the same moment
      return res.status(409).json({ message: "This email is already registered" });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+passwordHash"
    );

    // same message for "no such email" and "wrong password"
    const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ token: signToken(user.id), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (protected) - who is logged in?
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

// POST /api/auth/logout
// JWT tokens are stateless, so the browser simply deletes its saved token.
router.post("/logout", requireAuth, (req, res) => {
  res.json({ message: "Logged out" });
});

export default router;