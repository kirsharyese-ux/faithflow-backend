import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("BOOTING SERVER...");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// ✅ VERSION ROUTE
app.get("/version", (req, res) => {
  res.send("NEW VERSION LIVE");
});

// ✅ DEBUG: list all routes
app.get("/routes", (req, res) => {
  res.json({
    routes: [
      "GET /",
      "GET /version",
      "POST /api/ai/chat"
    ]
  });
});

// ✅ AI ROUTE (MUST BE HERE BEFORE listen)
app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  return res.json({
    reply: "Test mode: " + message
  });
});

// ✅ START SERVER (LAST THING ONLY)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});