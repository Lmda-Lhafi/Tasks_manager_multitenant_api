const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  domain: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

module.exports = mongoose.model("Client", clientSchema);
