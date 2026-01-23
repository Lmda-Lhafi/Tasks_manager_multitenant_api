const express = require("express");
const dotenv = require("dotenv");
const { errorHandler } = require("./middleware/errorhandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend 👋", mode: process.env.NODE_ENV });
});

app.use(errorHandler);
// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
