import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

try {
  console.log("🚀 Booting FaithFlow Backend...");

  dotenv.config();

  const app = express();

  // Initialize OpenAI client (may be undefined if no API key)
  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    try {
      console.log("📡 Root endpoint hit");
      res.send("Backend is working 🚀");
    } catch (error) {
      console.error("❌ Root route error:", error);
      res.status(500).send("Internal error");
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string" || message.trim() === "") {
        console.warn("⚠️ Invalid message");
        return res.status(400).json({ error: "Valid message required" });
      }

      console.log("🤖 Chat request received");

      // If OpenAI API key is not configured, return test mode response
      if (!openai) {
        console.log("⚠️ OpenAI API key not configured, using test mode");
        return res.json({ 
          reply: "Test mode: " + message,
          mode: "test"
        });
      }

      // Call OpenAI API
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: message }
          ]
        });

        const aiResponse = completion.choices[0].message.content;
        console.log("✅ OpenAI response received");
        res.json({ 
          reply: aiResponse,
          mode: "ai"
        });
      } catch (apiError) {
        console.error("❌ OpenAI API error:", apiError.message);
        res.status(500).json({ 
          error: "AI service error",
          details: apiError.message 
        });
      }
    } catch (error) {
      console.error("❌ Chat route error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("💥 Global error:", err.stack);
    res.status(500).json({ error: "Server error" });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (openai) {
      console.log("🤖 OpenAI integration active");
    } else {
      console.log("⚠️ OpenAI integration disabled (no API key configured)");
    }
  }).on('error', (err) => {
    console.error("💥 Server start error:", err);
    process.exit(1);
  });

} catch (error) {
  console.error("💥 Critical startup error:", error);
  process.exit(1);
}