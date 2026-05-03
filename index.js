import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting server...");

const app = express();

app.use(cors());
app.use(express.json());

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// AI route (temporary test version)
app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  res.json({
    reply: `Backend response: ${message}`
  });
});

// IMPORTANT: Render uses dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});