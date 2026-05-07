const express = require("express");
const router = express.Router();

const controller = require("../controllers/userController");
const protect = require("../middleware/protect");
const validate = require("../middleware/validate");
const { updateUserSchema, preferencesSchema } = require("../validators/userValidator");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management and preferences
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get the currently logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the authenticated user's data
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, controller.getMe);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     summary: Update username, bio, or avatar key
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *               avatarKey:
 *                 type: string
 *                 description: MinIO object key for avatar (placeholder for Phase 2)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.patch("/updateMe", protect, validate(updateUserSchema), controller.updateMe);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   patch:
 *     summary: Update in-app and email notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inApp:
 *                 type: object
 *                 properties:
 *                   followers: { type: boolean }
 *                   comments: { type: boolean }
 *                   likes: { type: boolean }
 *                   tips: { type: boolean }
 *               email:
 *                 type: object
 *                 properties:
 *                   followers: { type: boolean }
 *                   comments: { type: boolean }
 *                   likes: { type: boolean }
 *                   tips: { type: boolean }
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch("/preferences", protect, validate(preferencesSchema), controller.updatePreferences);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: View a specific user's public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: Returns the user's public profile
 *       404:
 *         description: User not found
 */
router.get("/:id", controller.getUser);

module.exports = router;