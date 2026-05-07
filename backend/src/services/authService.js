const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("./emailService");

exports.register = async (data) => {
  const { username, email, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }

  // Password hashed by User schema pre-save hook
  const user = await User.create({ username, email, password });

  // Send welcome email — non-blocking, won't crash if it fails
  emailService.sendWelcomeEmail(email, username);

  return user;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { user, token };
};