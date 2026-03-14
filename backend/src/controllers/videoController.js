const videoService = require("../services/videoService");

exports.createVideo = async (req, res) => {

  try {

    const video = await videoService.createVideo({
      ...req.body,
      owner: req.user.id
    });

    res.status(201).json(video);

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

};

exports.getVideos = async (req, res) => {

  const videos = await videoService.getVideos();

  res.json(videos);

};

exports.updateVideo = async (req, res) => {

  const video = await videoService.updateVideo(req.params.id, req.body);

  res.json(video);

};

exports.deleteVideo = async (req, res) => {

  await videoService.deleteVideo(req.params.id);

  res.json({ message: "Video deleted" });

};