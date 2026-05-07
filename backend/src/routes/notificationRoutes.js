// PERSON B
const express      = require("express");
const router       = express.Router();
const protect      = require("../middleware/protect");
const Notification = require("../models/Notification");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notification history
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get the authenticated user's notification history
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Not authenticated
 */
router.get("/", protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "username")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ status: "success", data: notifications });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/notifications/read
 * Mark all notifications as read
 */
router.patch("/read", protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.status(200).json({ status: "success", message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;