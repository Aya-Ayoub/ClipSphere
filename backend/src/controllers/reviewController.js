const reviewService = require("../services/reviewService");

exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ status: "fail", message: "Rating is required" });
    }

    const review = await reviewService.createReview({
      rating,
      comment,
      user: req.user.id,
      video: req.params.id
    });

    res.status(201).json({ status: "success", data: review });
  } catch (err) {
    //duplicate review
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "You have already reviewed this video"
      });
    }
    next(err);
  }
};