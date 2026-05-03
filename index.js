import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

console.log("🚀 SERVER FILE EXECUTING");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

app.use(cors());
app.use(express.json());

console.log("📡 REGISTERING ROUTES...");

// GET "/" route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// GET "/version" route
app.get("/version", (req, res) => {
  res.send("NEW VERSION LIVE");
});

// GET "/routes" route
app.get("/routes", (req, res) => {
  res.json({
    routes: [
      "GET /",
      "GET /version",
      "GET /routes",
      "POST /api/ai/chat"
    ]
  });
});

// POST "/api/ai/chat" route
app.post("/api/ai/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      reply: "Test mode: " + message
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful Christian Bible assistant. Give thoughtful, scripture-based responses."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return res.json({
      reply: completion.choices[0].message.content
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({
      error: "Failed to get AI response"
    });
  }
});

// Fallback middleware for 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});