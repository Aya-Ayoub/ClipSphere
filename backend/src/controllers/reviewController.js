const reviewService = require("../services/reviewService");

exports.createReview = async (req, res) => {

  try {

    const review = await reviewService.createReview({
      rating: req.body.rating,
      comment: req.body.comment,
      user: req.user.id,
      video: req.params.id
    });

    res.status(201).json(review);

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

};