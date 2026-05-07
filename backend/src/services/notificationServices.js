const User = require("../models/User");
const Notification = require("../models/Notification");
const emailService = require("./emailService"); // ADD THIS

exports.createIfAllowed = async (recipientId, senderId, type) => {
  const recipient = await User.findById(recipientId);

  if (!recipient) return;

  if (!recipient.active) return;

  const inAppAllowed = recipient.preferences?.inApp?.[type] ?? true;
  const emailAllowed = recipient.preferences?.email?.[type] ?? true;

  if (!inAppAllowed && !emailAllowed) {
    console.log(
      `Notification suppressed for user ${recipientId} — type "${type}" disabled in preferences`
    );
    return null;
  }

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

  // ADD THIS BLOCK — replaces the old TODO comment
  if (emailAllowed) {
    const sender = await User.findById(senderId);
    if (sender) {
      await emailService.sendEngagementEmail(
        recipient.email,
        recipient.username,
        type,
        sender.username
      );
    }
  }

  return notification;
};