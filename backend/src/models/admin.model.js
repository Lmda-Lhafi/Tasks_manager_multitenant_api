// User model (global) placeholder
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: false },
  username: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Admin", adminSchema);
