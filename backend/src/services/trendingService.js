// PERSON B
const Video  = require("../models/Video");
const Like   = require("../models/Like");
const Review = require("../models/Review");

/**
 * Recalculates and saves the trendingScore for a single video.
 *
 * Formula:
 *   Total_Score = (Likes x 10) + (Avg_Rating x 2) + Freshness_Bonus
 *
 * Freshness_Bonus:
 *   - Posted within last 24h  → +50
 *   - Posted within last 7d   → +20
 *   - Posted within last 30d  → +5
 *   - Older                   → 0
 */
exports.recalculateScore = async (videoId) => {
  const video = await Video.findById(videoId);
  if (!video) return;

  // Likes component
  const likeCount  = await Like.countDocuments({ video: videoId });
  const likeScore  = likeCount * 10;

  // Avg rating component
  const reviews    = await Review.find({ video: videoId });
  const avgRating  = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const ratingScore = avgRating * 2;

  // Freshness bonus
  const ageMs      = Date.now() - new Date(video.createdAt).getTime();
  const ageHours   = ageMs / (1000 * 60 * 60);
  let freshnessBonus = 0;
  if (ageHours < 24)        freshnessBonus = 50;
  else if (ageHours < 168)  freshnessBonus = 20; // 7 days
  else if (ageHours < 720)  freshnessBonus = 5;  // 30 days

  const trendingScore = Math.round(likeScore + ratingScore + freshnessBonus);

  await Video.findByIdAndUpdate(videoId, { trendingScore });

  return trendingScore;
};

/**
 * Returns the trending feed sorted by trendingScore descending.
 * Used as fallback in the following feed (Step C of bonus spec).
 */
exports.getTrendingByScore = async (skip = 0, limit = 9) => {
  return await Video.find({ status: "public" })
    .populate("owner", "username avatarKey")
    .sort({ trendingScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};