const stripeService = require("../services/stripeService");
const socketService = require("../services/socketService");
const User = require("../models/User");

// Lazy Stripe initialization — same pattern as stripeService
let _stripe;
const getStripe = () => {
  if (!_stripe) {
    const Stripe = require("stripe");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

/**
 * POST /api/v1/stripe/tip/:creatorId
 */
exports.createTipSession = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { amount, message } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ status: "fail", message: "Invalid tip amount" });
    }

    const amountCents = Math.round(parseFloat(amount) * 100);

    const { sessionId, sessionUrl } = await stripeService.createTipSession(
      req.user._id,
      creatorId,
      amountCents,
      message || ""
    );

    res.status(200).json({ status: "success", data: { sessionId, sessionUrl } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/stripe/webhook
 * Requires raw body — mounted with express.raw() in app.js
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret is configured yet (local dev without Stripe CLI),
  // just acknowledge the event so the server doesn't crash
  if (!endpointSecret) {
    console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set — skipping verification");
    return res.status(200).json({ received: true });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      const transaction = await stripeService.handleCheckoutComplete(session);
      if (transaction) {
        const sender = await User.findById(transaction.sender).select("username");
        socketService.emitTipNotification({
          recipientId: transaction.recipient,
          senderUsername: sender?.username || "Someone",
          amount: (transaction.amount / 100).toFixed(2),
          message: transaction.message || "",
        });
      }
    } catch (err) {
      console.error("[Stripe Webhook] Processing error:", err.message);
    }
  }

  res.status(200).json({ received: true });
};

/**
 * GET /api/v1/stripe/wallet
 */
exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await stripeService.getWallet(req.user._id);
    res.status(200).json({ status: "success", data: wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/stripe/session/:sessionId
 */
exports.getSession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.status(200).json({
      status: "success",
      data: {
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
      },
    });
  } catch (err) {
    next(err);
  }
};