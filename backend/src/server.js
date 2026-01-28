const express = require("express");
const { errorHandler } = require("./middleware/errorhandler");
const authroutes = require("./routes/auth.route");
const userroutes = require("./routes/user.route");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend 👋", mode: process.env.NODE_ENV });
});
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

app.use(errorHandler);

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
  });
