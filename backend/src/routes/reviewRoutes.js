const express = require("express");
const controller = require("../controllers/reviewController");
const protect = require("../middleware/protect");

const router = express.Router();

/**
 * @swagger
 * /api/v1/videos/{id}/reviews:
 *   post:
 *     summary: Submit a review for a video
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Video ID
 *         schema:
 *           type: string
 */
router.post("/:id/reviews", protect, controller.createReview);

module.exports = router;