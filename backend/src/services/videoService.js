// PERSON B
const Video           = require("../models/Video");
const minioService    = require("./minioService");
const trendingService = require("./trendingService");

// Redis cache — imported safely so service works without Redis too
let getRedis, CACHE_TTL;
try {
  const redisModule = require("../config/redis");
  getRedis   = redisModule.getRedis;
  CACHE_TTL  = redisModule.CACHE_TTL;
} catch {
  getRedis  = null;
  CACHE_TTL = { TRENDING: 60, VIDEOS: 30, VIDEO: 120 };
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

const cacheGet = async (key) => {
  try {
    if (!getRedis) return null;
    const redis = getRedis();
    const data  = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // cache miss is never fatal
  }
};

const cacheSet = async (key, value, ttl) => {
  try {
    if (!getRedis) return;
    const redis = getRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch {
    // ignore cache write errors
  }
};

const cacheDelete = async (key) => {
  try {
    if (!getRedis) return;
    const redis = getRedis();
    await redis.del(key);
  } catch {}
};

// Invalidate all feed caches (called when a new video is uploaded)
const invalidateFeedCaches = async () => {
  try {
    if (!getRedis) return;
    const redis   = getRedis();
    const keys    = await redis.keys("feed:*");
    if (keys.length) await redis.del(keys);
    console.log(`[Cache] Invalidated ${keys.length} feed cache keys`);
  } catch {}
};

// ── Shared helper ─────────────────────────────────────────────────────────────

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

// ── Service methods ───────────────────────────────────────────────────────────

exports.createVideo = async (data, filePath, userId) => {
  let videoURL = data.videoURL || null;

  if (filePath) {
    const fs   = require("fs");
    const path = require("path");
    const objectKey = `videos/${userId}-${Date.now()}-${path.basename(filePath)}`;
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

  // Set initial trending score
  await trendingService.recalculateScore(video._id);

  // Invalidate all feed caches so new video appears immediately
  await invalidateFeedCaches();

  return video;
};

exports.getVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const cacheKey = `feed:public:p${page}:l${limit}`;

  // Try cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(`[Cache] HIT — ${cacheKey}`);
    return cached;
  }

  const skip   = (page - 1) * limit;
  const videos = await Video.find({ status: "public" })
    .populate("owner", "username avatarKey")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const result = await attachSignedUrls(videos);
  await cacheSet(cacheKey, result, CACHE_TTL.VIDEOS);
  return result;
};

/**
 * Trending feed — cached in Redis for 60 seconds.
 * Sorts by trendingScore descending so highest-scored videos appear first.
 */
exports.getTrendingVideos = async (query = {}) => {
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const cacheKey = `feed:trending:p${page}:l${limit}`;

  // Try cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(`[Cache] HIT — ${cacheKey}`);
    return cached;
  }

  const skip   = (page - 1) * limit;
  const videos = await Video.aggregate([
    { $match: { status: "public" } },
    {
      $lookup: {
        from: "reviews", localField: "_id", foreignField: "video", as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating:   { $avg: "$reviews.rating" },
        reviewCount: { $size: "$reviews" },
      },
    },
    { $sort: { trendingScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users", localField: "owner", foreignField: "_id", as: "owner",
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

  const result = await attachSignedUrls(videos);

  // Cache for 60 seconds — trending feed is expensive to compute
  await cacheSet(cacheKey, result, CACHE_TTL.TRENDING);

  return result;
};

/**
 * Following feed — Step C (Bonus):
 * 1. Videos from followed users sorted by trendingScore desc
 * 2. Fill remaining with other high-score public videos
 */
exports.getFollowingFeed = async (userId, query = {}) => {
  const Follower = require("../models/Follower");
  const page  = Math.max(parseInt(query.page)  || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const following    = await Follower.find({ followerId: userId }).select("followingId");
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    const videos = await Video.find({ status: "public" })
      .populate("owner", "username avatarKey")
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return attachSignedUrls(videos);
  }

  const followedVideos = await Video.find({
    owner: { $in: followingIds }, status: "public",
  })
    .populate("owner", "username avatarKey")
    .sort({ trendingScore: -1, createdAt: -1 })
    .limit(limit + skip);

  let combined = followedVideos;
  if (combined.length < skip + limit) {
    const extras = await Video.find({
      status: "public",
      _id: { $nin: followedVideos.map((v) => v._id) },
    })
      .populate("owner", "username avatarKey")
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(limit);
    combined = [...followedVideos, ...extras];
  }

  return attachSignedUrls(combined.slice(skip, skip + limit));
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

  await invalidateFeedCaches();
  return await Video.findByIdAndDelete(id);
};

exports.getVideoById = async (id) => {
  const Review = require("../models/Review");
  const video  = await Video.findById(id).populate("owner", "username avatarKey");
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

// Export for use in admin cache-clear route
exports.invalidateFeedCaches = invalidateFeedCaches;