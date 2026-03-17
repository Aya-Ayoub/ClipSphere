const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (data) => {
  const { username, email, password } = data;

  // Check if email already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }

  // Password is hashed by the User schema pre-save hook
  const user = await User.create({ username, email, password });

  return user;
};

exports.login = async (email, password) => {
  // Must explicitly select password since it has select: false in schema
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