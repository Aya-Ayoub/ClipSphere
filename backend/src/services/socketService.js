const { getIO } = require("../config/socket");

/**
 * Emits a "new-like" notification to the video owner's private socket room.
 * Only fires if the liker is NOT the video owner (no self-notifications).
 *
 * Payload received by the client:
 *   { type: "like", likerUsername, videoTitle, videoId, timestamp }
 */
exports.emitLikeNotification = ({ ownerId, likerUsername, videoTitle, videoId }) => {
  try {
    const io = getIO();
    io.to(ownerId.toString()).emit("new-like", {
      type: "like",
      likerUsername,
      videoTitle,
      videoId,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Socket] new-like emitted to room ${ownerId}`);
  } catch (err) {
    // Socket might not be initialised in test environments — log and continue
    console.warn("[Socket] emitLikeNotification failed:", err.message);
  }
};

/**
 * Emits a "new-tip" notification to the creator's private socket room.
 *
 * Payload received by the client:
 *   { type: "tip", senderUsername, amount, message, timestamp }
 */
exports.emitTipNotification = ({ recipientId, senderUsername, amount, message }) => {
  try {
    const io = getIO();
    io.to(recipientId.toString()).emit("new-tip", {
      type: "tip",
      senderUsername,
      amount, // dollars (e.g. 5.00)
      message: message || "",
      timestamp: new Date().toISOString(),
    });
    console.log(`[Socket] new-tip emitted to room ${recipientId}`);
  } catch (err) {
    console.warn("[Socket] emitTipNotification failed:", err.message);
  }
};

/**
 * Emits a "new-follow" notification to the target user's room.
 *
 * Payload received by the client:
 *   { type: "follow", followerUsername, timestamp }
 */
exports.emitFollowNotification = ({ targetUserId, followerUsername }) => {
  try {
    const io = getIO();
    io.to(targetUserId.toString()).emit("new-follow", {
      type: "follow",
      followerUsername,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Socket] new-follow emitted to room ${targetUserId}`);
  } catch (err) {
    console.warn("[Socket] emitFollowNotification failed:", err.message);
  }
};

/**
 * Generic helper — emits any event to a user's private room.
 * Useful for future notification types.
 */
exports.emitToUser = (userId, event, payload) => {
  try {
    const io = getIO();
    io.to(userId.toString()).emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`[Socket] emitToUser(${event}) failed:`, err.message);
  }
};