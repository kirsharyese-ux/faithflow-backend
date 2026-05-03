import express from "express";
import cors from "cors";
import dotenv from "dotenv";

try {
  console.log("🚀 Booting FaithFlow Backend...");

  dotenv.config();

  const app = express();

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

  app.post("/api/ai/chat", (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string" || message.trim() === "") {
        console.warn("⚠️ Invalid message");
        return res.status(400).json({ error: "Valid message required" });
      }

      console.log("🤖 Chat request processed");
      res.json({ reply: "Test: " + message });
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
  }).on('error', (err) => {
    console.error("💥 Server start error:", err);
    process.exit(1);
  });

} catch (error) {
  console.error("💥 Critical startup error:", error);
  process.exit(1);
}