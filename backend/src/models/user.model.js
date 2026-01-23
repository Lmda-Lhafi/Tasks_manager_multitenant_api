const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// future more fields, like: name, profile picture, lastlogin, ...
const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isActive: { type: Boolean, default: true },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    // soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// indexes
userschema.index({ tenant: 1, isDeleted: 1 });
userschema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
userschema.index({ tenant: 1, email: 1, isDeleted: 1 });

// password hashing
userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userschema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// soft delete helper later.

module.exports = mongoose.model("User", userschema);
