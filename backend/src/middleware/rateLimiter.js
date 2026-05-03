const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Stricter limiter for auth routes (login / register).
 * Prevents brute-force attacks.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Stricter limiter for MinIO upload routes.
 * Prevents disk/bandwidth abuse.
 * 30 uploads per hour per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Upload limit reached. Please try again in an hour.",
  },
});

/**
 * Limiter for Stripe tip routes.
 * 10 tip initiations per 15 minutes per IP.
 */
const stripeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many payment requests, please try again later.",
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, stripeLimiter };