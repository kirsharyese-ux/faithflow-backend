import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// AI route
app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: "Backend response: " + message
  });
});

// 🚨 THIS IS THE MOST IMPORTANT PART
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});