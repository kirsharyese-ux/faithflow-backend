import express from "express";
import cors from "cors";

console.log("Starting server...");

const app = express();

app.use(cors());
app.use(express.json());

// Root test route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// AI test route
app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: "Backend response: " + message
  });
});

// IMPORTANT: use Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});