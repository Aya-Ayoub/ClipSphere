const express = require("express");
const controller = require("../controllers/videoController");
const protect = require("../middleware/protect");
const ownership = require("../middleware/ownershipMiddleware");
const validate = require("../middleware/validate");
const { createVideoSchema } = require("../validators/authValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video metadata CRUD and public feed
 */

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     summary: Create a video metadata record
 *     description: >
 *       Creates the video document in MongoDB. The actual file upload to MinIO
 *       is handled in Phase 2. Duration must not exceed 300 seconds (5 minutes).
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: My first cooking video
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: A quick tutorial on scrambled eggs
 *               duration:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 300
 *                 example: 120
 *               videoURL:
 *                 type: string
 *                 example: videos/user123-clip.mp4
 *               status:
 *                 type: string
 *                 enum: [public, private]
 *                 example: public
 *     responses:
 *       201:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Validation error (duration > 300s, missing title, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 */
router.post("/", protect, validate(createVideoSchema), controller.createVideo);

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     summary: Get public video feed (paginated)
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Paginated list of public videos
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
 */
router.get("/", controller.getVideos);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   patch:
 *     summary: Update a video's title or description (owner only)
 *     description: >
 *       Only the video owner can update their video. Admins cannot edit other users' videos
 *       (per spec: "Restricted Edit Permissions" for admins).
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the video
 *         schema:
 *           type: string
 *           example: 664a1b2c3d4e5f6789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: Updated video title
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated description
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – you do not own this video
 *       404:
 *         description: Video not found
 */
router.patch("/:id", protect, ownership.checkOwnership, controller.updateVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     summary: Delete a video (owner OR admin)
 *     description: >
 *       The video owner can delete their own video. Admins have "Global Delete"
 *       permission and can remove any video (e.g. for community moderation),
 *       but admins cannot edit videos they don't own.
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the video
 *         schema:
 *           type: string
 *           example: 664a1b2c3d4e5f6789012345
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden – you do not own this video (and are not an admin)
 *       404:
 *         description: Video not found
 */
router.delete("/:id", protect, ownership.checkOwnershipOrAdmin, controller.deleteVideo);

module.exports = router;