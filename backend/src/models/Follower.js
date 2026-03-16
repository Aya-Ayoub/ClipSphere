const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate follow relationships
followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Pre-save hook — prevents a user from following themselves
followerSchema.pre("save", function (next) {
  if (this.followerId.toString() === this.followingId.toString()) {
    return next(new Error("You cannot follow yourself"));
  }
});

module.exports = mongoose.model("Follower", followerSchema);