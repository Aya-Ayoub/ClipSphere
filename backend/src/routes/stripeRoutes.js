// PERSON B
const express    = require("express");
const { z }      = require("zod");
const router     = express.Router();
const controller = require("../controllers/stripeController");
const protect    = require("../middleware/protect");
const validate   = require("../middleware/validate");
const { stripeLimiter } = require("../middleware/rateLimiter");

// ── Zod schema for tip request body (Phase 3 — security validation) ───────────
const tipSchema = z.object({
  amount:  z.number({ required_error: "Amount is required" })
             .min(0.5, "Minimum tip amount is $0.50"),
  message: z.string().max(200, "Message cannot exceed 200 characters").optional(),
});

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Creator tipping and wallet endpoints
 */

/**
 * @swagger
 * /api/v1/stripe/tip/{creatorId}:
 *   post:
 *     summary: Create a Stripe Checkout Session to tip a creator
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the creator to tip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Tip amount in dollars (e.g. 5 = $5.00)
 *                 example: 5
 *               message:
 *                 type: string
 *                 description: Optional message to the creator
 *                 example: Great content, keep it up!
 *     responses:
 *       200:
 *         description: Returns Stripe Checkout Session URL
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
 *                     sessionId:
 *                       type: string
 *                     sessionUrl:
 *                       type: string
 *       400:
 *         description: Invalid amount or validation error
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Too many payment requests
 */
router.post(
  "/tip/:creatorId",
  protect,
  stripeLimiter,
  validate(tipSchema),    // ← Phase 3: Zod validation on tip body
  controller.createTipSession
);

/**
 * @swagger
 * /api/v1/stripe/wallet:
 *   get:
 *     summary: Get the authenticated creator's wallet balance and tip history
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet summary
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
 *                     totalEarned:
 *                       type: number
 *                       example: 25.00
 *                     pendingBalance:
 *                       type: number
 *                       example: 5.00
 *                     transactions:
 *                       type: array
 *       401:
 *         description: Not authenticated
 */
router.get("/wallet", protect, controller.getWallet);

/**
 * @swagger
 * /api/v1/stripe/session/{sessionId}:
 *   get:
 *     summary: Retrieve a Stripe session (used on success page)
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
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
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     customerEmail:
 *                       type: string
 */
router.get("/session/:sessionId", protect, controller.getSession);

/**
 * POST /api/v1/stripe/webhook
 * Stripe webhook — requires raw body (NOT parsed JSON).
 * Mounted separately in app.js with express.raw() BEFORE express.json().
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  controller.handleWebhook
);

module.exports = router;