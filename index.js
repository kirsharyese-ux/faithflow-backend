import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log("Starting server...");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// ✅ OPENAI SETUP (will work once API key is added)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ AI ROUTE (works with or without OpenAI for testing)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔹 TEMP TEST MODE (safe fallback)
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: "Test mode: " + message
      });
    }

    // 🔹 REAL OPENAI CALL
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ✅ IMPORTANT: REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});