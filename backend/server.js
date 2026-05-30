import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";
import authRoutes, { requireAuth } from "./routes/auth.js";
import adminRoutes, { getActiveModel } from "./routes/admin.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Public prompt templates (for GeneratorTab)
app.get("/api/prompt-templates", requireAuth, async (req, res) => {
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "",
});

// In-memory job store
const jobs = new Map();

// ─── Provider Adapters ────────────────────────────────────────────

async function generateOpenAI(prompt, config) {
  const params = typeof config.parameters === "string"
    ? JSON.parse(config.parameters)
    : (config.parameters || {});
  const result = await openai.images.generate({
    model: config.model_id,
    prompt,
    n: params.n || 1,
    size: params.size || "1024x1024",
    response_format: params.response_format || "b64_json",
  });
  const imageBase64 = result.data[0]?.b64_json;
  if (!imageBase64) throw new Error("OpenAI returned no image");
  return imageBase64;
}

async function generateFlux(prompt, config) {
  const params = typeof config.parameters === "string"
    ? JSON.parse(config.parameters)
    : (config.parameters || {});
  const payload = {
    prompt,
    mode: params.mode || "base",
    cfg_scale: params.cfg_scale || 3.5,
    width: params.width || 1024,
    height: params.height || 1024,
    seed: params.seed || 0,
    steps: params.steps || 50,
  };
  const response = await fetch(config.api_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (response.status !== 200) {
    const errBody = await response.text();
    throw new Error(`Flux invocation failed: ${response.status} ${errBody}`);
  }
  const body = await response.json();
  const imageBase64 = body.images?.[0];
  if (!imageBase64) throw new Error("Flux returned no image");
  return imageBase64;
}

async function generateGemini(prompt, config) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "",
  });
  const response = await ai.models.generateContent({
    model: config.model_id,
    contents: prompt,
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("Gemini returned no image");
}

const PROVIDERS = {
  openai: generateOpenAI,
  nvidia: generateFlux,
  google: generateGemini,
};

async function dispatchImageGeneration(prompt) {
  const model = await getActiveModel();
  if (!model) throw new Error("No active image generation model configured");
  const generate = PROVIDERS[model.provider];
  if (!generate) throw new Error(`Unknown provider: ${model.provider}`);
  return generate(prompt, model);
}

// ─── Active Model Info (public) ──────────────────────────────────

app.get("/api/active-model", async (_req, res) => {
  try {
    const model = await getActiveModel();
    if (!model) return res.json({ name: null, provider: null });
    res.json({ name: model.name, provider: model.provider, model_id: model.model_id });
  } catch (err) {
    console.error("Active model error:", err);
    res.status(500).json({ error: "failed to get active model" });
  }
});

// ─── Image Generation ────────────────────────────────────────────

app.post("/api/generate-image", requireAuth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job = { id: jobId, userId: req.userId, done: false, imagePath: null, error: null };
  jobs.set(jobId, job);

  (async () => {
    try {
      const imageBase64 = await dispatchImageGeneration(prompt);

      // Save to filesystem
      const userDir = path.join(UPLOADS_DIR, String(req.userId));
      await fs.mkdir(userDir, { recursive: true });
      const filename = `${jobId}.png`;
      const filePath = path.join(userDir, filename);
      await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));

      job.imagePath = `/uploads/${req.userId}/${filename}`;
      job.done = true;
    } catch (err) {
      console.error("Image generation failed:", err);
      job.error = err instanceof Error ? err.message : "generation failed";
      job.done = true;
    }
    setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000);
  })();

  res.json({ jobId });
});

app.get("/api/generate-image/:jobId", requireAuth, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "job not found" });
  if (job.userId !== req.userId) return res.status(403).json({ error: "access denied" });
  res.json({ done: job.done, imagePath: job.imagePath, error: job.error });
});

// ─── Asset Panel ─────────────────────────────────────────────────

app.get("/api/asset/panel/:userId", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*,
        (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id AND p.is_public = TRUE) as project_count,
        (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id AND p.status = 'minted') as minted_count,
        (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id AND p.is_collectible = TRUE) as collectible_count,
        (SELECT GROUP_CONCAT(DISTINCT p.city) FROM projects p WHERE p.user_id = u.id AND p.is_public = TRUE) as cities,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('type', s.series_type, 'name', s.name, 'count', JSON_LENGTH(s.project_ids)))
         FROM archive_series s WHERE s.user_id = u.id) as series_summary
       FROM users u WHERE u.id = ?`,
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "user not found" });

    const user = rows[0];

    // Recent archives
    const [projects] = await pool.query(
      `SELECT asset_id, title, city, time_period, score_total, score_time, score_space, score_human, score_taste,
        card_type, is_collectible, collectible_price, license_type, minted_at
       FROM projects WHERE user_id = ? AND is_public = TRUE
       ORDER BY minted_at DESC LIMIT 12`,
      [req.params.userId]
    );

    // City stats
    const [cityStats] = await pool.query(
      `SELECT city, COUNT(*) as count, AVG(score_total) as avg_score
       FROM projects WHERE user_id = ? AND city IS NOT NULL AND is_public = TRUE
       GROUP BY city ORDER BY count DESC`,
      [req.params.userId]
    );

    // Score trend: compare last 5 vs previous 5
    const [scoreData] = await pool.query(
      `SELECT score_total FROM projects WHERE user_id = ? AND score_total IS NOT NULL AND is_public = TRUE
       ORDER BY minted_at DESC LIMIT 10`,
      [req.params.userId]
    );
    let trend = 0;
    if (scoreData.length >= 6) {
      const recent5 = scoreData.slice(0, 5).reduce((s, r) => s + Number(r.score_total), 0) / 5;
      const prev5 = scoreData.slice(5, 10).reduce((s, r) => s + Number(r.score_total), 0) / 5;
      trend = prev5 > 0 ? ((recent5 - prev5) / prev5) * 100 : 0;
    }

    // Collectible cards
    const [cards] = await pool.query(
      `SELECT c.id, c.card_number, c.price, c.status, p.asset_id, p.title, p.city, p.score_total
       FROM collectible_cards c JOIN projects p ON c.project_id = p.id
       WHERE c.seller_id = ? AND c.status IN ('available','reserved')
       ORDER BY c.listed_at DESC`,
      [req.params.userId]
    );

    // B-end services
    const [bServices] = await pool.query(
      `SELECT * FROM b_services WHERE partner_id = ? ORDER BY created_at DESC`,
      [req.params.userId]
    );

    res.json({
      user: {
        id: user.id, username: user.username, display_name: user.display_name,
        city: user.city, bio: user.bio, avatar_url: user.avatar_url,
        homepage_url: user.homepage_url,
      },
      asset_summary: {
        total_archives: user.total_archives,
        herein_tier: user.herein_tier_archives,
        minted: user.minted_count,
        cities: user.cities ? user.cities.split(',') : [],
        series: user.series_summary || [],
      },
      scores: {
        avg_total: Number(user.avg_score),
        time: Number(user.avg_time_score),
        space: Number(user.avg_space_score),
        human: Number(user.avg_human_score),
        taste: Number(user.avg_taste_score),
        trend: Number(trend.toFixed(1)),
      },
      city_partner: {
        cities: user.city_partner_cities || [],
        qualified: (user.city_partner_cities || []).length > 0,
      },
      asset_value: {
        collectible_cards: user.collectible_cards_count,
        cards_for_sale: cards.filter(c => c.status === 'available').length,
        b_services_available: bServices.length,
        copyright_licensable: user.total_archives,
      },
      recent_projects: projects,
      city_stats: cityStats,
      cards,
    });
  } catch (err) {
    console.error("Asset panel error:", err);
    res.status(500).json({ error: "failed to load asset data" });
  }
});

// ─── Public Profile ──────────────────────────────────────────────

app.get("/api/user/:username", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, display_name, avatar_url, bio, city,
        total_archives, herein_tier_archives, avg_score,
        avg_time_score, avg_space_score, avg_human_score, avg_taste_score,
        score_trend, city_partner_cities, homepage_url, created_at
       FROM users WHERE username = ?`,
      [req.params.username]
    );
    if (rows.length === 0) return res.status(404).json({ error: "user not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "failed to load profile" });
  }
});

app.get("/api/user/:username/projects", async (req, res) => {
  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE username = ?", [req.params.username]);
    if (userRows.length === 0) return res.status(404).json({ error: "user not found" });

    const [projects] = await pool.query(
      `SELECT asset_id, title, city, time_period, card_type, score_total, score_time, score_space, score_human, score_taste,
        generated_image_base64, image_path, is_collectible, collectible_price, minted_at, latitude, longitude
       FROM projects WHERE user_id = ? AND is_public = TRUE
       ORDER BY minted_at DESC`,
      [userRows[0].id]
    );
    res.json(projects);
  } catch (err) {
    console.error("Projects error:", err);
    res.status(500).json({ error: "failed to load projects" });
  }
});

// ─── My Projects (Gallery) ────────────────────────────────────────

app.get("/api/projects/mine", requireAuth, async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT asset_id, title, city, time_period, card_type, score_total,
        score_time, score_space, score_human, score_taste,
        generated_image_base64, image_path, ai_prompt_en, ai_prompt_cn,
        is_collectible, collectible_price, minted_at, is_public
       FROM projects WHERE user_id = ?
       ORDER BY minted_at DESC`,
      [req.userId]
    );
    res.json(projects);
  } catch (err) {
    console.error("My projects error:", err);
    res.status(500).json({ error: "failed to load projects" });
  }
});

// ─── Project Save / Mint ─────────────────────────────────────────

app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const { title, city, timePeriod, cardType, sceneDetails, stylePreset, aiPromptEn, aiPromptCn, imageBase64, imagePath, isPublic, isCollectible } = req.body;
    const userId = req.userId;

    // Generate asset ID
    const cityCode = (city || 'XX').slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X');
    const [countResult] = await pool.query("SELECT COUNT(*) as cnt FROM projects WHERE city = ?", [city]);
    const seq = String(countResult[0].cnt + 1).padStart(3, '0');
    const assetId = `${cityCode}-${seq}`;

    // Generate S701 scores (simplified demo scoring)
    const detailCount = sceneDetails ? sceneDetails.length : 0;
    const scoreTime = Math.min(10, 6 + detailCount * 0.6);
    const scoreSpace = Math.min(10, 5.5 + (city ? 2 : 0) + detailCount * 0.4);
    const scoreHuman = Math.min(10, 7 + detailCount * 0.5);
    const scoreTaste = Math.min(10, 6 + (stylePreset ? 2 : 0) + detailCount * 0.3);
    const scoreTotal = scoreTime + scoreSpace + scoreHuman + scoreTaste;

    const [result] = await pool.query(
      `INSERT INTO projects (user_id, asset_id, title, city, time_period, card_type, scene_details,
        ai_prompt_en, ai_prompt_cn, style_preset, generated_image_base64, image_path,
        score_time, score_space, score_human, score_taste, score_total,
        owner_id, is_public, is_collectible, collectible_price, status, asset_tier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'minted',
         CASE WHEN ? >= 36 THEN 'capability' ELSE 'identity' END)`,
      [userId, assetId, title, city, timePeriod, cardType, JSON.stringify(sceneDetails),
        aiPromptEn, aiPromptCn, stylePreset, imageBase64 || null, imagePath || null,
        scoreTime, scoreSpace, scoreHuman, scoreTaste, scoreTotal,
        userId, isPublic !== false, isCollectible || false, isCollectible ? 899.00 : null, scoreTotal]
    );

    // Update user stats
    await pool.query(
      `UPDATE users SET total_archives = total_archives + 1,
        herein_tier_archives = (SELECT COUNT(*) FROM projects WHERE user_id = ? AND score_total >= 36)
       WHERE id = ?`,
      [userId, userId]
    );

    // Refresh user averages
    await pool.query(
      `UPDATE users u SET
        avg_score = (SELECT AVG(score_total) FROM projects WHERE user_id = u.id AND score_total IS NOT NULL),
        avg_time_score = (SELECT AVG(score_time) FROM projects WHERE user_id = u.id AND score_time IS NOT NULL),
        avg_space_score = (SELECT AVG(score_space) FROM projects WHERE user_id = u.id AND score_space IS NOT NULL),
        avg_human_score = (SELECT AVG(score_human) FROM projects WHERE user_id = u.id AND score_human IS NOT NULL),
        avg_taste_score = (SELECT AVG(score_taste) FROM projects WHERE user_id = u.id AND score_taste IS NOT NULL)
       WHERE id = ?`,
      [userId]
    );

    // Create transfer record for mint
    await pool.query(
      `INSERT INTO asset_transfers (project_id, asset_id, from_user_id, to_user_id, transfer_type)
       VALUES (?, ?, ?, ?, 'mint')`,
      [result.insertId, assetId, userId, userId]
    );

    res.json({
      assetId, projectId: result.insertId,
      scores: { time: scoreTime, space: scoreSpace, human: scoreHuman, taste: scoreTaste, total: scoreTotal }
    });
  } catch (err) {
    console.error("Project save error:", err);
    res.status(500).json({ error: "failed to save project" });
  }
});

// ─── City Partner Check ──────────────────────────────────────────

app.get("/api/asset/partner-check/:userId", requireAuth, async (req, res) => {
  try {
    const [cityCounts] = await pool.query(
      `SELECT city, COUNT(*) as cnt,
        (SELECT COUNT(*) FROM projects p2 WHERE p2.user_id = p1.user_id AND p2.city = p1.city AND p2.asset_tier = 'capability') as b_count
       FROM projects p1 WHERE user_id = ? AND city IS NOT NULL AND is_public = TRUE
       GROUP BY city HAVING cnt >= 8`,
      [req.params.userId]
    );

    const partnerCities = cityCounts.filter(r => r.b_count >= 1).map(r => r.city);
    await pool.query("UPDATE users SET city_partner_cities = ? WHERE id = ?", [JSON.stringify(partnerCities), req.params.userId]);

    res.json({ partner_cities: partnerCities, qualified: partnerCities.length > 0 });
  } catch (err) {
    console.error("Partner check error:", err);
    res.status(500).json({ error: "failed to check partner status" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
