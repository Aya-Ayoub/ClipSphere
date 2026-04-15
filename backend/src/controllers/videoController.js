// PERSON B
const videoService = require("../services/videoService");

exports.createVideo = async (req, res, next) => {
  try {
    const filePath = req.file ? req.file.path : null;

    // Merge ffmpeg duration into body
    const data = {
      ...req.body,
      ...(req.videoDuration && { duration: req.videoDuration }),
    };

    const video = await videoService.createVideo(data, filePath, req.user.id);
    res.status(201).json({ status: "success", data: video });
  } catch (err) {
    next(err);
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    const videos = await videoService.getVideos(req.query);
    res.status(200).json({ status: "success", results: videos.length, data: videos });
  } catch (err) {
    next(err);
  }
};

exports.getTrendingVideos = async (req, res, next) => {
  try {
    const videos = await videoService.getTrendingVideos(req.query);
    res.status(200).json({ status: "success", results: videos.length, data: videos });
  } catch (err) {
    next(err);
  }
};

exports.getFollowingFeed = async (req, res, next) => {
  try {
    const videos = await videoService.getFollowingFeed(req.user.id, req.query);
    res.status(200).json({ status: "success", results: videos.length, data: videos });
  } catch (err) {
    next(err);
  }
};

exports.getVideoById = async (req, res, next) => {
  try {
    const video = await videoService.getVideoById(req.params.id);
    if (!video) return res.status(404).json({ status: "fail", message: "Video not found" });
    res.status(200).json({ status: "success", data: video });
  } catch (err) {
    next(err);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const video = await videoService.updateVideo(req.params.id, req.body);
    if (!video) return res.status(404).json({ status: "fail", message: "Video not found" });
    res.status(200).json({ status: "success", data: video });
  } catch (err) {
    next(err);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await videoService.deleteVideo(req.params.id);
    if (!video) return res.status(404).json({ status: "fail", message: "Video not found" });
    res.status(200).json({ status: "success", message: "Video deleted successfully" });
  } catch (err) {
    next(err);
  }
};


