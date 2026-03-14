const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

//prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

//prevent self-follow
followSchema.pre("save", function (next) {
  if (this.followerId.toString() === this.followingId.toString()) {
    const err = new Error("You cannot follow yourself");
    err.statusCode = 400;
    return next(err);
  }
  next();
});

module.exports = mongoose.model("Follow", followSchema);