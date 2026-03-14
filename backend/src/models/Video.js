const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"]
    },

    videoURL: {
      type: String
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 second"],
      max: [300, "Video must not exceed 300 seconds (5 minutes)"]
    },

    viewsCount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["public", "private", "flagged"],
      default: "public"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);