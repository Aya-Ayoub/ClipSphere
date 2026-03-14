const express = require("express");
const controller = require("../controllers/adminController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management endpoints
 */

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: System health check
 *     description: Returns server uptime, memory usage, and database connection status.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 3600.5
 *                     memory:
 *                       type: object
 *                     database:
 *                       type: string
 *                       example: connected
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – admin role required
 */
router.get("/health", controller.healthCheck);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     description: >
 *       Uses MongoDB aggregation pipelines to return total users, total videos,
 *       total tips processed (Phase 3), and the most active users of the week.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 142
 *                     totalVideos:
 *                       type: integer
 *                       example: 530
 *                     totalTips:
 *                       type: integer
 *                       example: 0
 *                     mostActiveUsersThisWeek:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           videoCount:
 *                             type: integer
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – admin role required
 */
router.get("/stats", controller.getStats);

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Deactivate or reactivate a user account (soft delete / ban hammer)
 *     description: >
 *       Sets the user's `active` flag and `accountStatus` field.
 *       A banned user cannot log in; their token will be rejected by the protect middleware.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the target user
 *         schema:
 *           type: string
 *           example: 664a1b2c3d4e5f6789012345
 *     requestBody:
 *       required: false
 *       description: Optionally pass `active` boolean to reactivate a user (defaults to false = ban)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – admin role required
 */
router.patch("/users/:id/status", controller.banUser);

/**
 * @swagger
 * /api/v1/admin/moderation:
 *   get:
 *     summary: Content moderation queue
 *     description: Returns all videos with status "flagged" (low review scores or user-reported content).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of flagged videos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – admin role required
 */
router.get("/moderation", controller.getModerationQueue);

module.exports = router;