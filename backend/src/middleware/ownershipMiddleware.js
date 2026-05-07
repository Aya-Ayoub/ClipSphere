const Video = require("../models/Video");

exports.checkOwnership = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ status: "fail", message: "Video not found" });
    }

    if (video.owner.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ status: "fail", message: "Forbidden: you do not own this video" });
    }

    //attach to reques
    req.video = video;
    next();
  } catch (err) {
    next(err);
  }
};

exports.checkOwnershipOrAdmin = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ status: "fail", message: "Video not found" });
    }

    const isOwner = video.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ status: "fail", message: "Forbidden: you do not own this video" });
    }

    req.video = video;
    next();
  } catch (err) {
    next(err);
  }
};