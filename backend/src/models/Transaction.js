const mongoose = require("mongoose");

/**
 * Transaction collection — financial ledger for creator tips.
 *
 * Every successful Stripe checkout.session.completed event creates
 * one Transaction document. This lets creators see their pending
 * balance and full tip history.
 */
const transactionSchema = new mongoose.Schema(
  {
    // The user who sent the tip
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The creator who receives the tip
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Amount in cents (Stripe always works in smallest currency unit)
    amount: {
      type: Number,
      required: true,
      min: [50, "Minimum tip is 50 cents ($0.50)"],
    },

    // ISO 4217 currency code
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },

    // Stripe identifiers for reconciliation
    stripeSessionId: {
      type: String,
      required: true,
      unique: true, // prevents double-processing the same webhook
    },

    stripePaymentIntentId: {
      type: String,
    },

    // pending → completed once webhook confirms payment
    // failed  → if payment was not captured
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    // Optional message from tipper to creator
    message: {
      type: String,
      maxlength: 200,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast wallet queries (all tips received by a creator)
transactionSchema.index({ recipient: 1, status: 1 });
// Index for sender's tip history
transactionSchema.index({ sender: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);