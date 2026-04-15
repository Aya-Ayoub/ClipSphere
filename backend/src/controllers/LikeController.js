const Like  = require("../models/Like");

exports.likeVideo = async (req, res, next) => {
  try {
    await Like.create({ user: req.user.id, video: req.params.id });
    const count = await Like.countDocuments({ video: req.params.id });
    res.status(201).json({ status: "success", liked: true, count });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: "fail", message: "Already liked" });
    }
    next(err);
  }
};

exports.unlikeVideo = async (req, res, next) => {
  try {
    await Like.deleteOne({ user: req.user.id, video: req.params.id });
    const count = await Like.countDocuments({ video: req.params.id });
    res.status(200).json({ status: "success", liked: false, count });
  } catch (err) {
    next(err);
  }
};

exports.getLikes = async (req, res, next) => {
  try {
    const count   = await Like.countDocuments({ video: req.params.id });
    const userLiked = req.user
      ? !!(await Like.findOne({ user: req.user.id, video: req.params.id }))
      : false;
    res.status(200).json({ status: "success", count, liked: userLiked });
  } catch (err) {
    next(err);
  }
};