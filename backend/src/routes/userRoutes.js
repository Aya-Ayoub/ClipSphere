const express = require("express");
const controller = require("../controllers/userController");
const followController = require("../controllers/followController");
const protect = require("../middleware/protect");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", protect, controller.getMe);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/updateMe", protect, controller.updateMe);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/preferences", protect, controller.updatePreferences);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 */
router.get("/:id", controller.getUser);

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post("/:id/follow", protect, followController.followUser);

/**
 * @swagger
 * /api/v1/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/:id/unfollow", protect, followController.unfollowUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: Get followers
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id/followers", followController.getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     summary: Get following list
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id/following", followController.getFollowing);

module.exports = router;