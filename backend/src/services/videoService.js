// PERSON B
const Video      = require("../models/Video");
const minioService = require("./minioService");

/**
 * Create a video record AFTER the file is confirmed uploaded to MinIO.
 * The videoURL (MinIO object key) is only saved once upload succeeds —
 * this prevents orphaned database records.
 */
exports.createVideo = async (data, filePath, userId) => {
  let videoURL = data.videoURL || null;

  // If a file was uploaded, send it to MinIO first
  if (filePath) {
    const fs = require("fs");
    const path = require("path");

    const fileName = path.basename(filePath);
    const objectKey = `videos/${userId}-${Date.now()}-${fileName}`;

    const mimeType = "video/mp4"; // or detect if you want

    await minioService.uploadFile(filePath, objectKey, mimeType);

    videoURL = objectKey;

    // optional cleanup (good practice)
    fs.unlinkSync(filePath);
  }

  // Duration safety check
  if (data.duration && data.duration > 300) {
    const err = new Error("Video must not exceed 300 seconds (5 minutes)");
    err.statusCode = 400;
    throw err;
  }

  return await Video.create({
    ...data,
    owner: userId,
    videoURL,
  });
};

/**
 * Returns paginated public videos with presigned URLs.
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

  // Attach presigned URLs so frontend can play videos securely
  const videosWithUrls = await Promise.all(
    videos.map(async (video) => {
      const obj = video.toObject();
      if (obj.videoURL) {
        try {
          obj.signedUrl = await minioService.getPresignedUrl(obj.videoURL);
        } catch {
          obj.signedUrl = null;
        }
      }
      return obj;
    })
  );

  return videosWithUrls;
};

/**
 * Trending feed — sorted by average review score and recent engagement.
 * Consumes the same aggregation logic as admin stats (Phase 1 Section 7).
 */
exports.getTrendingVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const videos = await Video.aggregate([
    { $match: { status: "public" } },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "video",
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating:   { $avg: "$reviews.rating" },
        reviewCount: { $size: "$reviews" },
      },
    },
    { $sort: { avgRating: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1, description: 1, videoURL: 1, duration: 1,
        viewsCount: 1, status: 1, createdAt: 1,
        avgRating: 1, reviewCount: 1,
        "owner.username": 1, "owner.avatarKey": 1,
      },
    },
  ]);

  // Attach presigned URLs
  return await Promise.all(
    videos.map(async (video) => {
      if (video.videoURL) {
        try { video.signedUrl = await minioService.getPresignedUrl(video.videoURL); }
        catch { video.signedUrl = null; }
      }
      return video;
    })
  );
};

/**
 * Following feed — only videos from users the current user follows.
 */
exports.getFollowingFeed = async (userId, query = {}) => {
  const Follower = require("../models/Follower");
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const following = await Follower.find({ followerId: userId }).select("followingId");
  const followingIds = following.map((f) => f.followingId);

  const videos = await Video.find({ owner: { $in: followingIds }, status: "public" })
    .populate("owner", "username avatarKey")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return await Promise.all(
    videos.map(async (video) => {
      const obj = video.toObject();
      if (obj.videoURL) {
        try { obj.signedUrl = await minioService.getPresignedUrl(obj.videoURL); }
        catch { obj.signedUrl = null; }
      }
      return obj;
    })
  );
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

  // Delete from MinIO if it has a stored file
  if (video.videoURL) {
    try { await minioService.deleteFile(video.videoURL); }
    catch (e) { console.warn("MinIO delete failed:", e.message); }
  }

  return await Video.findByIdAndDelete(id);
};

/**
 * Get a single video with a fresh presigned URL.
 */
exports.getVideoById = async (id) => {
  const video = await Video.findById(id).populate("owner", "username avatarKey");
  if (!video) return null;

  const Review = require("../models/Review");
  const reviews = await Review.find({ video: id })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  const obj = video.toObject();
  obj.reviews = reviews;

  if (obj.videoURL) {
    try { obj.signedUrl = await minioService.getPresignedUrl(obj.videoURL); }
    catch { obj.signedUrl = null; }
  }
  return obj;
};