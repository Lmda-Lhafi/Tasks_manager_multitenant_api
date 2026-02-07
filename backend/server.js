const express = require("express");
const { errorHandler } = require("./middleware/errorhandler");
const authroutes = require("./routes/auth.route");
const userroutes = require("./routes/user.route");
const taskroutes = require("./routes/task.route");
const connectDB = require("./config/db");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config({ path: path.join(__dirname, "../.env") });
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend 👋", mode: process.env.NODE_ENV });
});
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);
app.use("/api/task", taskroutes);

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
