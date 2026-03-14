const Review = require("../models/Review");

exports.createReview = async (data) => {

  return await Review.create(data);

};