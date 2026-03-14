const Follow = require("../models/Follow");

exports.followUser = async (req, res) => {
  try {

    const follow = await Follow.create({
      followerId: req.user.id,
      followingId: req.params.id
    });

    res.status(201).json(follow);

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
};

exports.unfollowUser = async (req, res) => {
  try {

    await Follow.findOneAndDelete({
      followerId: req.user.id,
      followingId: req.params.id
    });

    res.json({ message: "Unfollowed" });

  } catch (err) {

    res.status(400).json({ message: err.message });

  }
};

exports.getFollowers = async (req, res) => {
  try {

    const followers = await Follow.find({
      followingId: req.params.id
    });

    res.json(followers);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }
};

exports.getFollowing = async (req, res) => {
  try {

    const following = await Follow.find({
      followerId: req.params.id
    });

    res.json(following);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }
};