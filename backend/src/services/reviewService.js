const Review = require("../models/Review");
const Video = require("../models/Video");

exports.createReview = async (data) => {
  //make sure video exists and is public
  const video = await Video.findById(data.video);
  if (!video) throw new Error("Video not found");
  if (video.status !== "public") throw new Error("Cannot review a non-public video");

  return await Review.create(data);
};