// Task model (tenant) placeholder

const mongoose = require("mongoose");

// future more fields, like: priority, duedate, tags, ...
const taskschema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["todo", "in-progress", "done"] },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    assignedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// indexes
taskschema.index({ tenantid: 1, isDeleted: 1 });
taskschema.index({ tenantid: 1, status: 1, isDeleted: 1 });
taskschema.index({ tenantid: 1, assignedUsers: 1, isDeleted: 1 });
taskschema.index({ tenantid: 1, createdBy: 1, isDeleted: 1 });

module.exports = mongoose.model("Task", taskschema);
