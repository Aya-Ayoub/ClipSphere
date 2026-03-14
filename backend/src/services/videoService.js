const Video = require("../models/Video");

exports.createVideo = async (data) => {

  if (data.duration > 300) {
    throw new Error("Video must be less than 5 minutes");
  }

  return await Video.create(data);
};

exports.getVideos = async () => {
  return await Video.find({ status: "public" });
};

exports.updateVideo = async (id, data) => {
  return await Video.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteVideo = async (id) => {
  return await Video.findByIdAndDelete(id);
};