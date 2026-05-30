import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "./auth.js";

const router = Router();

// ─── Admin Middleware ──────────────────────────────────────────────

export async function requireAdmin(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [req.userId]);
    if (rows.length === 0 || !rows[0].is_admin) {
      return res.status(403).json({ error: "admin access required" });
    }
    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "admin check failed" });
  }
}

// ─── Prompt Templates CRUD ─────────────────────────────────────────

router.get("/prompt-templates", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM prompt_templates WHERE is_active = TRUE ORDER BY sort_order"
    );
    res.json(rows);
  } catch (err) {
    console.error("List templates error:", err);
    res.status(500).json({ error: "failed to load templates" });
  }
});

router.post("/prompt-templates", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { template_key, name, english_keywords, chinese_keywords, color_tone, card_type, sort_order } = req.body;
    if (!template_key || !name) {
      return res.status(400).json({ error: "template_key and name are required" });
    }
    const [result] = await pool.query(
      `INSERT INTO prompt_templates (template_key, name, english_keywords, chinese_keywords, color_tone, card_type, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), english_keywords=VALUES(english_keywords), chinese_keywords=VALUES(chinese_keywords), color_tone=VALUES(color_tone), card_type=VALUES(card_type), sort_order=VALUES(sort_order)`,
      [template_key, name, english_keywords || "", chinese_keywords || "", color_tone || "", card_type || "content", sort_order || 0]
    );
    res.json({ id: result.insertId, template_key, name });
  } catch (err) {
    console.error("Save template error:", err);
    res.status(500).json({ error: "failed to save template" });
  }
});

router.put("/prompt-templates/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, english_keywords, chinese_keywords, color_tone, card_type, sort_order, is_active } = req.body;
    const [result] = await pool.query(
      `UPDATE prompt_templates SET name=?, english_keywords=?, chinese_keywords=?, color_tone=?, card_type=?, sort_order=?, is_active=?
       WHERE id=?`,
      [name, english_keywords, chinese_keywords, color_tone, card_type, sort_order, is_active !== false, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "template not found" });
    res.json({ id: Number(req.params.id), name });
  } catch (err) {
    console.error("Update template error:", err);
    res.status(500).json({ error: "failed to update template" });
  }
});

router.delete("/prompt-templates/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query("UPDATE prompt_templates SET is_active = FALSE WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "template not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ error: "failed to delete template" });
  }
});

// ─── Model Configs CRUD ────────────────────────────────────────────

router.get("/model-configs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM model_configs ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("List models error:", err);
    res.status(500).json({ error: "failed to load models" });
  }
});

router.post("/model-configs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, provider, model_id, api_endpoint, parameters, is_active } = req.body;
    if (!name || !provider || !model_id) {
      return res.status(400).json({ error: "name, provider, and model_id are required" });
    }
    // If activating, deactivate all others
    if (is_active) {
      await pool.query("UPDATE model_configs SET is_active = FALSE");
    }
    const [result] = await pool.query(
      `INSERT INTO model_configs (name, provider, model_id, api_endpoint, parameters, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, provider, model_id, api_endpoint || null, parameters ? JSON.stringify(parameters) : null, is_active || false]
    );
    clearModelCache();
    res.json({ id: result.insertId, name, provider, model_id });
  } catch (err) {
    console.error("Create model error:", err);
    res.status(500).json({ error: "failed to create model" });
  }
});

router.put("/model-configs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, provider, model_id, api_endpoint, parameters, is_active } = req.body;
    // If activating this model, deactivate all others
    if (is_active) {
      await pool.query("UPDATE model_configs SET is_active = FALSE");
    }
    const [result] = await pool.query(
      `UPDATE model_configs SET name=?, provider=?, model_id=?, api_endpoint=?, parameters=?, is_active=?
       WHERE id=?`,
      [name, provider, model_id, api_endpoint || null, parameters ? JSON.stringify(parameters) : null, is_active || false, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "model not found" });
    // Invalidate model cache
    clearModelCache();
    res.json({ id: Number(req.params.id), name });
  } catch (err) {
    console.error("Update model error:", err);
    res.status(500).json({ error: "failed to update model" });
  }
});

router.delete("/model-configs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM model_configs WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "model not found" });
    clearModelCache();
    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete model error:", err);
    res.status(500).json({ error: "failed to delete model" });
  }
});

// ─── Model Cache (in-memory) ───────────────────────────────────────

let cachedModel = null;

export async function getActiveModel() {
  if (cachedModel) return cachedModel;
  const [rows] = await pool.query(
    "SELECT * FROM model_configs WHERE is_active = TRUE LIMIT 1"
  );
  cachedModel = rows.length > 0 ? rows[0] : null;
  return cachedModel;
}

export function clearModelCache() {
  cachedModel = null;
}

export default router;
