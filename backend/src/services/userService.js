const User = require("../models/User");

exports.getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.updateMe = async (userId, updates) => {
  // Whitelist allowed fields — prevents privilege escalation (e.g. cannot change role or password)
  const allowedFields = ["username", "bio", "avatarKey"];
  const safeUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  });

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.getUser = async (userId) => {
  const user = await User.findById(userId).select("username bio avatarKey role createdAt");
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Updates notification preferences using dot-notation $set so that
 * sending only { inApp: { likes: false } } does NOT wipe the email prefs.
 *
 * Example body:
 *   { "inApp": { "likes": false }, "email": { "followers": false } }
 */
exports.updatePreferences = async (userId, preferences) => {
  // Build a flat $set object so MongoDB merges rather than replaces
  const setObj = {};

  if (preferences.inApp) {
    Object.entries(preferences.inApp).forEach(([key, val]) => {
      setObj[`preferences.inApp.${key}`] = val;
    });
  }

  if (preferences.email) {
    Object.entries(preferences.email).forEach(([key, val]) => {
      setObj[`preferences.email.${key}`] = val;
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: setObj },
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};