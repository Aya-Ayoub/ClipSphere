const Follower = require("../models/Follower");
const notificationService = require("./notificationService");

exports.followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    const err = new Error("Cannot follow yourself");
    err.status = 400;
    throw err;
  }

  const follow = await Follower.create({ followerId, followingId });

  await notificationService.createIfAllowed(followingId, followerId, "follow");

  return follow;
};

exports.unfollowUser = async (followerId, followingId) => {
  const result = await Follower.deleteOne({ followerId, followingId });

  if (result.deletedCount === 0) {
    const err = new Error("You are not following this user");
    err.status = 404;
    throw err;
  }
};

exports.getFollowers = async (userId) => {
  return await Follower.find({ followingId: userId }).populate(
    "followerId",
    "username avatarKey"
  );
};

exports.getFollowing = async (userId) => {
  return await Follower.find({ followerId: userId }).populate(
    "followingId",
    "username avatarKey"
  );
};