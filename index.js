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

app.get("/version", (req, res) => {
  res.send("NEW VERSION LIVE");
});

// ✅ FORCE AI ROUTE (THIS IS WHAT YOU WERE MISSING)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    return res.json({
      reply: "Test mode: " + message
    });

  } catch (error) {
    console.error("Route error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

// ✅ PORT (ONLY ONCE)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});