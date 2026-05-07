// PERSON B
const Video          = require("../models/Video");
const minioService   = require("./minioService");
const trendingService = require("./trendingService");

/**
 * Attach presigned URLs to an array of video objects.
 */
const attachSignedUrls = async (videos) => {
  return Promise.all(
    videos.map(async (video) => {
      const obj = video.toObject ? video.toObject() : video;
      if (obj.videoURL) {
        try { obj.signedUrl = await minioService.getPresignedUrl(obj.videoURL); }
        catch { obj.signedUrl = null; }
      }
      return obj;
    })
  );
};

/**
 * Create a video record AFTER the file is confirmed uploaded to MinIO.
 */
exports.createVideo = async (data, filePath, userId) => {
  let videoURL = data.videoURL || null;

  if (filePath) {
    const fs   = require("fs");
    const path = require("path");
    const fileName  = path.basename(filePath);
    const objectKey = `videos/${userId}-${Date.now()}-${fileName}`;
    await minioService.uploadFile(filePath, objectKey, "video/mp4");
    videoURL = objectKey;
    fs.unlinkSync(filePath);
  }

  if (data.duration && data.duration > 300) {
    const err = new Error("Video must not exceed 300 seconds (5 minutes)");
    err.statusCode = 400;
    throw err;
  }

  const video = await Video.create({ ...data, owner: userId, videoURL });

  // Set initial trendingScore (freshness bonus applied immediately)
  await trendingService.recalculateScore(video._id);

  return video;
};

/**
 * Public feed — paginated, sorted by newest.
 */
exports.getVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const videos = await Video.find({ status: "public" })
    .populate("owner", "username avatarKey")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return attachSignedUrls(videos);
};

/**
 * Trending feed — sorted by trendingScore descending.
 */
exports.getTrendingVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const videos = await Video.aggregate([
    { $match: { status: "public" } },
    {
      $lookup: {
        from:         "reviews",
        localField:   "_id",
        foreignField: "video",
        as:           "reviews",
      },
    },
    {
      $addFields: {
        avgRating:    { $avg: "$reviews.rating" },
        reviewCount:  { $size: "$reviews" },
      },
    },
    { $sort: { trendingScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from:         "users",
        localField:   "owner",
        foreignField: "_id",
        as:           "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1, description: 1, videoURL: 1, duration: 1,
        viewsCount: 1, status: 1, createdAt: 1,
        trendingScore: 1, avgRating: 1, reviewCount: 1,
        "owner._id": 1, "owner.username": 1, "owner.avatarKey": 1,
      },
    },
  ]);

  return attachSignedUrls(videos);
};

/**
 * Following feed — Step C (Bonus):
 * 1. Videos from followed users first (sorted by trendingScore desc)
 * 2. Then remaining public videos by trendingScore desc
 */
exports.getFollowingFeed = async (userId, query = {}) => {
  const Follower = require("../models/Follower");
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  // Get list of users the current user follows
  const following    = await Follower.find({ followerId: userId }).select("followingId");
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    // Not following anyone — fall back to trendingScore sort
    const videos = await Video.find({ status: "public" })
      .populate("owner", "username avatarKey")
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return attachSignedUrls(videos);
  }

  // Step 1: videos from followed users, sorted by trendingScore
  const followedVideos = await Video.find({
    owner:  { $in: followingIds },
    status: "public",
  })
    .populate("owner", "username avatarKey")
    .sort({ trendingScore: -1, createdAt: -1 })
    .limit(limit + skip);

  // Step 2: if we don't have enough, fill with other high-score videos
  let combined = followedVideos;

  if (combined.length < skip + limit) {
    const followedVideoIds = followedVideos.map((v) => v._id);
    const extras = await Video.find({
      status: "public",
      _id:    { $nin: followedVideoIds },
    })
      .populate("owner", "username avatarKey")
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(limit);
    combined = [...followedVideos, ...extras];
  }

  const paginated = combined.slice(skip, skip + limit);
  return attachSignedUrls(paginated);
};

exports.updateVideo = async (id, data) => {
  const { title, description } = data;
  return await Video.findByIdAndUpdate(
    id,
    {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
    { new: true, runValidators: true }
  );
};

exports.deleteVideo = async (id) => {
  const video = await Video.findById(id);
  if (!video) return null;

  if (video.videoURL) {
    try { await minioService.deleteFile(video.videoURL); }
    catch (e) { console.warn("MinIO delete failed:", e.message); }
  }

  return await Video.findByIdAndDelete(id);
};

exports.getVideoById = async (id) => {
  const Review = require("../models/Review");

  const video = await Video.findById(id).populate("owner", "username avatarKey");
  if (!video) return null;

  const reviews = await Review.find({ video: id })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  const obj     = video.toObject();
  obj.reviews   = reviews;

  if (obj.videoURL) {
    try { obj.signedUrl = await minioService.getPresignedUrl(obj.videoURL); }
    catch { obj.signedUrl = null; }
  }

  return obj;
};