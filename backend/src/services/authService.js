const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (data) => {

  const { username, email, password } = data;

  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // create user (password will be hashed by schema middleware)
  const user = await User.create({
    username,
    email,
    password
  });

  return user;
};

exports.login = async (email, password) => {

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { user, token };
};