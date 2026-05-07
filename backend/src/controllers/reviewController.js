// PERSON B
const reviewService   = require("../services/reviewService");
const trendingService = require("../services/trendingService");

exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ status: "fail", message: "Rating is required" });
    }

    const review = await reviewService.createReview({
      rating,
      comment,
      user:  req.user.id,
      video: req.params.id,
    });

    // ── Trending Score: recalculate when a review is added ────────────────
    // avg_rating component changes → full recalculation needed
    await trendingService.recalculateScore(req.params.id);

    res.status(201).json({ status: "success", data: review });
  } catch (err) {
    // duplicate review
    if (err.code === 11000) {
      return res.status(409).json({
        status:  "fail",
        message: "You have already reviewed this video",
      });
    }
    next(err);
  }
};