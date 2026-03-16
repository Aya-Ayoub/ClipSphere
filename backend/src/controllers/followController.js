const Follower = require("../models/Follower");

exports.followUser = async (req, res, next) => {
  try {
    // Controller-level self-follow check (schema pre-save hook is the second line of defense)
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const follow = await Follower.create({
      followerId: req.user.id,
      followingId: req.params.id,
    });

    res.status(201).json(follow);
  } catch (err) {
    // Handle duplicate follow (compound unique index violation)
    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already following this user" });
    }
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    await Follower.deleteOne({
      followerId: req.user.id,
      followingId: req.params.id,
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const followers = await Follower.find({
      followingId: req.params.id,
    }).populate("followerId", "username avatarKey");

    res.json(followers);
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const following = await Follower.find({
      followerId: req.params.id,
    }).populate("followingId", "username avatarKey");

    res.json(following);
  } catch (err) {
    next(err);
  }
};