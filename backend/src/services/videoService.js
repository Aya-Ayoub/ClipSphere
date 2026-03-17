const Video = require("../models/Video");

exports.createVideo = async (data) => {
  if (data.duration > 300) {
    const err = new Error("Video must not exceed 300 seconds (5 minutes)");
    err.statusCode = 400;
    throw err;
  }
  return await Video.create(data);
};

/**
 * Returns paginated public videos.
 * Query params: page (default 1), limit (default 10)
 */
exports.getVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  return await Video.find({ status: "public" })
    .populate("owner", "username avatarKey")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

exports.updateVideo = async (id, data) => {
  // Whitelist — only title and description can be updated
  const { title, description } = data;
  return await Video.findByIdAndUpdate(
    id,
    { ...(title !== undefined && { title }), ...(description !== undefined && { description }) },
    { new: true, runValidators: true }
  );
};

exports.deleteVideo = async (id) => {
  return await Video.findByIdAndDelete(id);
};