const express = require("express");
const controller = require("../controllers/videoController");
const protect = require("../middleware/protect");
const ownership = require("../middleware/ownershipMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     summary: Create a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", protect, controller.createVideo);

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     summary: Get public video feed
 *     tags: [Videos]
 */
router.get("/", controller.getVideos);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   patch:
 *     summary: Update a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch("/:id", protect, ownership.checkOwnership, controller.updateVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/:id", protect, ownership.checkOwnership, controller.deleteVideo);

module.exports = router;