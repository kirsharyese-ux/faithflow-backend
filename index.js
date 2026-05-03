import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting FaithFlow Backend...");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  try {
    console.log("📡 Root endpoint accessed");
    res.send("Backend is working 🚀");
  } catch (error) {
    console.error("❌ Error in root route:", error);
    next(error);
  }
});

app.post("/api/ai/chat", (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      console.warn("⚠️ Invalid message received:", message);
      return res.status(400).json({ error: "Valid message is required" });
    }

    console.log("🤖 AI chat request:", message.substring(0, 50) + "...");
    res.json({ reply: "Test mode: " + message });
  } catch (error) {
    console.error("❌ Error in AI chat route:", error);
    next(error);
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Global error handler:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Ready to accept connections`);
});