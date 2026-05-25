import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const result = await client.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1024",
    });

    const imageUrl = result.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL returned from API");
    }

    // 3. 在后端将图片 URL 转换为 Base64 字符串
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString('base64');

    res.json({ image: imageBase64 });
  } catch (err) {
    console.error("Image generation failed:", err);
    res.status(500).json({ error: "image generation failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
