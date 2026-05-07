const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    bio: {
      type: String,
      maxlength: 200,
    },

    // Placeholder for MinIO object key (used in Phase 2)
    avatarKey: {
      type: String,
    },

    // Soft delete — admin can deactivate accounts
    active: {
      type: Boolean,
      default: true,
    },

    // Moderation status — used by admin ban hammer
    accountStatus: {
      type: String,
      enum: ["active", "banned", "suspended"],
      default: "active",
    },

    // Notification preferences
    preferences: {
      inApp: {
        followers: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
      },
      email: {
        followers: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving if it was modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);