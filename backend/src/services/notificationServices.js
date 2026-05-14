const User         = require("../models/User");
const Notification = require("../models/Notification");

exports.createIfAllowed = async (recipientId, senderId, type, videoTitle = "") => {
  const recipient = await User.findById(recipientId);

  if (!recipient) return;
  if (!recipient.active) return;

  const inAppAllowed = recipient.preferences?.inApp?.[type] ?? true;
  const emailAllowed = recipient.preferences?.email?.[type] ?? true;

  if (!inAppAllowed && !emailAllowed) {
    console.log(`Notification suppressed for user ${recipientId} — type "${type}" disabled in preferences`);
    return null;
  }

  let notification = null;

  if (inAppAllowed) {
    notification = await Notification.create({
      recipient: recipientId,
      sender:    senderId,
      type,
    });
    console.log(`In-app notification created for user ${recipientId} — type "${type}"`);
  }

  if (emailAllowed) {
    try {
      const { emailQueue } = require("../config/bull");
      const { queueEmail } = require("./emailQueue");
      await queueEmail(emailQueue, {
        recipientId: recipientId.toString(),
        senderId:    senderId.toString(),
        type,
        videoTitle:  videoTitle || "",
      });
      console.log(`[NotificationService] Email job queued for ${recipientId} — type: ${type}`);
    } catch (err) {
      console.error("[NotificationService] Failed to queue email:", err.message);
    }
  }

  return notification;
};