import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: "This is your new backend responding to: " + message,
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});