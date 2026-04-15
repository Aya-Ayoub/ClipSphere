const followService = require("../services/followService");

exports.followUser = async (req, res, next) => {
  try {
    const follow = await followService.followUser(req.user.id, req.params.id);
    res.status(201).json({ status: "success", data: follow });
  } catch (err) {
    // Handle duplicate follow (compound unique index violation)
    if (err.code === 11000) {
      return res.status(400).json({ status: "fail", message: "You are already following this user" });
    }
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    await followService.unfollowUser(req.user.id, req.params.id);
    res.status(200).json({ status: "success", message: "Unfollowed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const followers = await followService.getFollowers(req.params.id);
    res.status(200).json({ status: "success", results: followers.length, data: followers });
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const following = await followService.getFollowing(req.params.id);
    res.status(200).json({ status: "success", results: following.length, data: following });
  } catch (err) {
    next(err);
  }
};

exports.getFollowStatus = async (req, res, next) => {
  try {
    const follow = await followService.isFollowing(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      status: "success",
      following: follow,
    });
  } catch (err) {
    next(err);
  }
};