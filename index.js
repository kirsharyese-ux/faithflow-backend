import express from "express";
import cors from "cors";
import dotenv from "dotenv";

console.log("🚀 SERVER FILE EXECUTING");

dotenv.config();

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
app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  return res.json({
    reply: "Test mode: " + message
  });
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