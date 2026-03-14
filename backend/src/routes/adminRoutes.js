const express = require("express");
const controller = require("../controllers/adminController");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns total users and videos
 */
router.get("/stats", protect, restrictTo("admin"), controller.getStats);

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Ban or deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch("/users/:id/status", protect, restrictTo("admin"), controller.banUser);

/**
 * @swagger
 * /api/v1/admin/moderation:
 *   get:
 *     summary: Get flagged videos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of flagged videos
 */
router.get("/moderation", protect, restrictTo("admin"), controller.getModerationQueue);

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: System health check
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Server health information
 */
router.get("/health", protect, restrictTo("admin"), controller.healthCheck);

module.exports = router;