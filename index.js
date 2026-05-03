import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting FaithFlow Backend...");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("📡 Root endpoint accessed");
  res.send("Backend is working 🚀");
});

app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    console.warn("⚠️ Invalid message received");
    return res.status(400).json({ error: "Valid message is required" });
  }

  console.log("🤖 AI chat request received");
  res.json({ reply: "Test mode: " + message });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});