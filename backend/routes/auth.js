import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const SALT_ROUNDS = 12;

// ─── Register ──────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, displayName, city } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    // Check existing
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, city, total_archives, herein_tier_archives, avg_score, avg_time_score, avg_space_score, avg_human_score, avg_taste_score, score_trend, collectible_cards_count)
       VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
      [username, email, passwordHash, displayName || username, city || null]
    );

    const token = jwt.sign({ userId: result.insertId, username }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: result.insertId, username, displayName: displayName || username, city: city || null },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "registration failed" });
  }
});

// ─── Login ─────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT id, username, email, display_name, city, password_hash FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const user = rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: "account has no password set" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        city: user.city,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "login failed" });
  }
});

// ─── JWT Middleware ─────────────────────────────────────────────────

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

export default router;
