// PERSON B
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    videoURL: {
      type: String,
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 second"],
      max: [300, "Video must not exceed 300 seconds (5 minutes)"],
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["public", "private", "flagged"],
      default: "public",
    },

    // ── Phase 3: Bonus — Trending Score ──────────────────────────────────────
    // Total_Score = (Likes x 10) + (Avg_Rating x 2) + Freshness_Bonus
    // Updated automatically by likeController and reviewController
    trendingScore: {
      type: Number,
      default: 0,
      index: true, // indexed for fast sorting in trending feed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);