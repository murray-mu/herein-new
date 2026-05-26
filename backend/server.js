import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory job store
const jobs = new Map();

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job = { id: jobId, done: false, image: null, error: null };
  jobs.set(jobId, job);

  // Fire and forget — generates in background
  (async () => {
    try {
      const result = await openai.images.generate({
        model: "gpt-image-2",
        prompt,
      });

      const imageBase64 = result.data[0].b64_json;
      if (!imageBase64) {
        throw new Error("No b64_json returned from API");
      }

      job.image = imageBase64;
      job.done = true;
    } catch (err) {
      console.error("Image generation failed:", err);
      job.error = err instanceof Error ? err.message : "generation failed";
      job.done = true;
    }

    // Auto-clean after 5 minutes
    setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000);
  })();

  res.json({ jobId });
});

app.get("/api/generate-image/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "job not found" });
  }
  res.json({
    done: job.done,
    image: job.image,
    error: job.error,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
