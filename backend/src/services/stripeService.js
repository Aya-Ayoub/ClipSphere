const Stripe = require("stripe");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Lazy initialization — Stripe is only created when first needed,
// by which point dotenv has already loaded the .env file.
let _stripe;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      const err = new Error("STRIPE_SECRET_KEY is not set in .env");
      err.statusCode = 500;
      throw err;
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

exports.createTipSession = async (senderId, recipientId, amountCents, message = "") => {
  const stripe = getStripe();

  const creator = await User.findById(recipientId).select("username");
  if (!creator) {
    const err = new Error("Creator not found");
    err.statusCode = 404;
    throw err;
  }

  const sender = await User.findById(senderId).select("username email");
  if (!sender) {
    const err = new Error("Sender not found");
    err.statusCode = 404;
    throw err;
  }

  if (amountCents < 50) {
    const err = new Error("Minimum tip amount is $0.50");
    err.statusCode = 400;
    throw err;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tip for @${creator.username}`,
            description: message || `Supporting @${creator.username} on ClipSphere`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      senderId: senderId.toString(),
      recipientId: recipientId.toString(),
      message: message || "",
    },
    customer_email: sender.email,
    success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/tips/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/profile/${recipientId}`,
  });

  await Transaction.create({
    sender: senderId,
    recipient: recipientId,
    amount: amountCents,
    currency: "usd",
    stripeSessionId: session.id,
    status: "pending",
    message,
  });

  return { sessionId: session.id, sessionUrl: session.url };
};

exports.handleCheckoutComplete = async (session) => {
  const transaction = await Transaction.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      status: "completed",
      stripePaymentIntentId: session.payment_intent || null,
    },
    { new: true }
  );

  if (!transaction) {
    console.warn(`[Stripe] No transaction found for session ${session.id}`);
    return null;
  }

  console.log(
    `[Stripe] Tip confirmed — $${(transaction.amount / 100).toFixed(2)} ` +
    `from user ${transaction.sender} to creator ${transaction.recipient}`
  );

  return transaction;
};

exports.getWallet = async (userId) => {
  const transactions = await Transaction.find({ recipient: userId })
    .populate("sender", "username")
    .sort({ createdAt: -1 });

  const completed = transactions.filter((t) => t.status === "completed");
  const pending   = transactions.filter((t) => t.status === "pending");

  const totalEarned    = completed.reduce((sum, t) => sum + t.amount, 0) / 100;
  const pendingBalance = pending.reduce((sum, t) => sum + t.amount, 0) / 100;

  return { totalEarned, pendingBalance, transactions };
};