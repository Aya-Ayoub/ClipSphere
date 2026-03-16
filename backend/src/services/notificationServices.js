const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * Checks the recipient's notification preferences and creates
 * a notification record if their settings allow it.
 *
 * @param {string} recipientId - The user receiving the notification
 * @param {string} senderId - The user who triggered the action
 * @param {string} type - "follow" | "comment" | "like" | "tip"
 */
exports.createIfAllowed = async (recipientId, senderId, type) => {
  // Fetch the recipient so we can check their preferences
  const recipient = await User.findById(recipientId);

  if (!recipient) return;

  // Don't notify if account is inactive
  if (!recipient.active) return;

  const inAppAllowed = recipient.preferences?.inApp?.[type] ?? true;
  const emailAllowed = recipient.preferences?.email?.[type] ?? true;

  // If neither in-app nor email notifications are allowed, do nothing
  if (!inAppAllowed && !emailAllowed) {
    console.log(
      `Notification suppressed for user ${recipientId} — type "${type}" disabled in preferences`
    );
    return null;
  }

  // Create the in-app notification record if allowed
  let notification = null;

  if (inAppAllowed) {
    notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
    });

    console.log(
      `In-app notification created for user ${recipientId} — type "${type}"`
    );
  }

  // Email would be queued here in Phase 2 (Nodemailer integration)
  if (emailAllowed) {
    console.log(
      `Email notification queued for user ${recipientId} — type "${type}" (Phase 2)`
    );
    // TODO Phase 2: emailQueue.add({ recipientId, senderId, type });
  }

  return notification;
};