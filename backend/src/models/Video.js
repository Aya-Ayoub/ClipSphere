const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  videoURL: {
    type: String
  },

  duration: {
    type: Number,
    required: true,
    max: 300
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