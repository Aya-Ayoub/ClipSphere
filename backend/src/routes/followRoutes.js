const express = require("express");
const router = express.Router();

const controller = require("../controllers/followController");
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Follow and unfollow users, view social graph
 */

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user to follow
 *     responses:
 *       201:
 *         description: Successfully followed the user
 *       400:
 *         description: Cannot follow yourself or already following
 *       401:
 *         description: Not authenticated
 */
router.post("/:id/follow", protect, controller.followUser);

/**
 * @swagger
 * /api/v1/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed
 *       401:
 *         description: Not authenticated
 */
router.delete("/:id/unfollow", protect, controller.unfollowUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: List all users following this account
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the target user
 *     responses:
 *       200:
 *         description: Array of follower records
 */
router.get("/:id/followers", controller.getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     summary: List all accounts this user follows
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the target user
 *     responses:
 *       200:
 *         description: Array of following records
 */
router.get("/:id/following", controller.getFollowing);

module.exports = router;