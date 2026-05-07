const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // The user who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The user who triggered the action
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What type of action triggered this notification
    type: {
      type: String,
      enum: ["follow", "comment", "like", "tip"],
      required: true,
    },

    // Whether the recipient has seen it
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);