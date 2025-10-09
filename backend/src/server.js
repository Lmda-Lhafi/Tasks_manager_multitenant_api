const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); 
const adminRoutes = require("./routes/admin.routes");
const clientLoginRoutes = require("./routes/client.loging.routes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend 👋", mode: process.env.NODE_ENV });
});
app.use("/api", adminRoutes);
app.use("/api/clients", clientLoginRoutes);   // Client login routes


// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});
