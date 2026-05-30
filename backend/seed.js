import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

async function seed() {
  console.log("Seeding database...\n");

  // ─── Seed Model Configs ─────────────────────────────────────────

  const [existingModels] = await pool.query("SELECT COUNT(*) as cnt FROM model_configs");
  if (existingModels[0].cnt === 0) {
    console.log("Inserting model configs...");

    await pool.query(
      `INSERT INTO model_configs (name, provider, model_id, api_endpoint, parameters, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "OpenAI gpt-image-2",
        "openai",
        "gpt-image-2",
        null,
        null,
        true, // active by default
      ]
    );

    await pool.query(
      `INSERT INTO model_configs (name, provider, model_id, api_endpoint, parameters, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "NVIDIA Flux.1-dev",
        "nvidia",
        "flux.1-dev",
        "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev",
        JSON.stringify({
          mode: "base",
          cfg_scale: 3.5,
          width: 1024,
          height: 1024,
          seed: 0,
          steps: 50,
        }),
        false,
      ]
    );

    await pool.query(
      `INSERT INTO model_configs (name, provider, model_id, api_endpoint, parameters, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Google Gemini 3.1 Flash Image",
        "google",
        "gemini-3.1-flash-image",
        null,
        null,
        false,
      ]
    );

    console.log("  ✓ 3 model configs inserted");
  } else {
    console.log(`  - model_configs already has ${existingModels[0].cnt} rows, skipping`);
  }

  // ─── Seed Prompt Templates ──────────────────────────────────────

  const [existingTemplates] = await pool.query("SELECT COUNT(*) as cnt FROM prompt_templates");
  if (existingTemplates[0].cnt === 0) {
    console.log("Inserting prompt templates...");

    const templates = [
      {
        template_key: "cinematic_realism",
        name: "电影纪实 (35mm)",
        english_keywords:
          "cinematic realism, 35mm photograph, documentary style, hyper-realistic details, authentic street atmosphere, subtle color grading, natural light",
        chinese_keywords:
          "电影感纪实、35毫米镜头摄影、纪录片风格、极致细节、真实街头氛围、微弱调色、自然光影",
        color_tone: "Low saturation, natural contrast, moody lighting / 低饱和度，自然对比，情绪光影",
        card_type: "content",
        sort_order: 1,
      },
      {
        template_key: "street_photography",
        name: "纪实抓拍 (Leica)",
        english_keywords:
          "Leica M11 style street photography, candid moment, high micro-contrast, crisp textures, grain, fleeting moment, organic capture",
        chinese_keywords:
          "徕卡街头抓拍、抓拍瞬间、高微对比、清晰肌理、自然颗粒感、稍纵即逝的瞬间、有机的捕捉",
        color_tone: "Classic chrome, organic film grain / 经典纪实胶片，细腻颗粒",
        card_type: "content",
        sort_order: 2,
      },
      {
        template_key: "moody_rain",
        name: "微雨湿润 (Rainy Mood)",
        english_keywords:
          "wet street reflections, rain droplets, condensation on glass, misty ambiance, neon glow bleeding through raindrops, cold color palette mixed with warm light sources",
        chinese_keywords:
          "湿润街头倒影、细腻雨滴、玻璃冷凝水汽、薄雾弥漫氛围、霓虹微光穿透雨水、冷色调衬托暖光源",
        color_tone: "Moody blues, amber highlights / 情绪暗蓝，琥珀暖色高光",
        card_type: "content",
        sort_order: 3,
      },
      {
        template_key: "warm_nostalgia",
        name: "落日暖调 (Golden Hour)",
        english_keywords:
          "golden hour light, long warm shadows, nostalgia ambiance, sunset glow, dust motes floating in light beam, intimate atmosphere",
        chinese_keywords:
          "落日余晖、漫长温暖投影、复古怀旧氛围、晚霞斜照、光束中漂浮的微尘、亲密的日常感",
        color_tone: "Warm golden hue, faded blacks / 温暖金黄，复古褪色暗部",
        card_type: "content",
        sort_order: 4,
      },
    ];

    for (const t of templates) {
      await pool.query(
        `INSERT INTO prompt_templates (template_key, name, english_keywords, chinese_keywords, color_tone, card_type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.template_key, t.name, t.english_keywords, t.chinese_keywords, t.color_tone, t.card_type, t.sort_order]
      );
    }

    console.log(`  ✓ ${templates.length} prompt templates inserted`);
  } else {
    console.log(`  - prompt_templates already has ${existingTemplates[0].cnt} rows, skipping`);
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
