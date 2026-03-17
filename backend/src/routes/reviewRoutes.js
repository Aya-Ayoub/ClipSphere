const express = require("express");
const controller = require("../controllers/reviewController");
const protect = require("../middleware/protect");
const validate = require("../middleware/validate");
const { reviewSchema } = require("../validators/authValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Video review and rating system
 */

/**
 * @swagger
 * /api/v1/videos/{id}/reviews:
 *   post:
 *     summary: Submit a 1–5 star review for a video
 *     description: >
 *       A user can only submit one review per video (enforced by a compound unique index).
 *       Rating must be an integer between 1 and 5.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the video being reviewed
 *         schema:
 *           type: string
 *           example: 664a1b2c3d4e5f6789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Great video, very informative!
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error (rating out of range, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Video not found
 *       409:
 *         description: You have already reviewed this video
 */
router.post("/:id/reviews", protect, validate(reviewSchema), controller.createReview);

module.exports = router;