// PERSON B
const Like            = require("../models/Like");
const Video           = require("../models/Video");
const User            = require("../models/User");
const trendingService = require("../services/trendingService");

let socketService;
try { socketService = require("../services/socketService"); } catch { socketService = null; }

exports.likeVideo = async (req, res, next) => {
  try {
    await Like.create({ user: req.user.id, video: req.params.id });
    const count = await Like.countDocuments({ video: req.params.id });

    // ── Trending Score: recalculate on like ───────────────────────────────
    await trendingService.recalculateScore(req.params.id);

    // ── Socket.io: emit "new-like" only if owner allows it ────────────────
    const video = await Video.findById(req.params.id).select("owner title");
    if (video && video.owner.toString() !== req.user.id.toString()) {

      // Check recipient's inApp likes preference before emitting
      const owner = await User.findById(video.owner).select("preferences active");
      const inAppAllowed = owner?.preferences?.inApp?.likes ?? true;

      if (inAppAllowed && socketService?.emitLikeNotification) {
        socketService.emitLikeNotification({
          ownerId:       video.owner,
          likerUsername: req.user.username,
          videoTitle:    video.title,
          videoId:       video._id,
        });
      }
    }

    res.status(201).json({ status: "success", liked: true, count });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: "fail", message: "Already liked" });
    }
    next(err);
  }
};

exports.unlikeVideo = async (req, res, next) => {
  try {
    await Like.deleteOne({ user: req.user.id, video: req.params.id });
    const count = await Like.countDocuments({ video: req.params.id });

    // ── Trending Score: recalculate after unlike ──────────────────────────
    await trendingService.recalculateScore(req.params.id);

    res.status(200).json({ status: "success", liked: false, count });
  } catch (err) {
    next(err);
  }
};

exports.getLikes = async (req, res, next) => {
  try {
    const count = await Like.countDocuments({ video: req.params.id });
    const userLiked = req.user
      ? !!(await Like.findOne({ user: req.user.id, video: req.params.id }))
      : false;
    res.status(200).json({ status: "success", count, liked: userLiked });
  } catch (err) {
    next(err);
  }
};