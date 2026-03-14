const User = require("../models/User");
const Video = require("../models/Video");

exports.getStats = async () => {

  const users = await User.countDocuments();
  const videos = await Video.countDocuments();

  return { users, videos };

};

exports.banUser = async (id) => {

  return await User.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );

};

exports.getFlaggedVideos = async () => {

  return await Video.find({ status: "flagged" });

};