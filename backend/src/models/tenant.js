const mongoose = require("mongoose");

// future more fields, like: domain, settings, ...
const tenantschema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" }, // change to external enums for more flexible.

    // soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// indexes
tenantschema.index({ isDeleted: 1, status: 1 });
tenantschema.index({ status: 1 });
tenantschema.index({ deletedAt: 1 });
module.exports = mongoose.model("Tenant", tenantschema);
