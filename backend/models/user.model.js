const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// future more fields, like: name, profile picture, lastlogin, ...
const userchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
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
userchema.index({ tenant: 1, isDeleted: 1 });
userchema.index(
  { tenant: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

userchema.pre("save", async function () {
  // generate a friendly name from the email
  if (!this.name && this.email) {
    const local = String(this.email).split("@")[0];
    this.name = local
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  
  // password hashing
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// soft delete helper later

module.exports = mongoose.model("User", userchema);
