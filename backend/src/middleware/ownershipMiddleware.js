const Video = require("../models/Video");

exports.checkOwnership = async (req, res, next) => {

  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (video.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};