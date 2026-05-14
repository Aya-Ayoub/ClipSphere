const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const followRoutes       = require("./routes/followRoutes");
const videoRoutes        = require("./routes/videoRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const adminRoutes        = require("./routes/adminRoutes");
const likeRoutes         = require("./routes/likeRoutes");
const stripeRoutes       = require("./routes/stripeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { initBuckets }     = require("./config/minio");
const globalErrorHandler  = require("./middleware/globalErrorHandler");
const { apiLimiter, authLimiter, uploadLimiter } = require("./middleware/rateLimiter");
const { connectRedis } = require("./config/redis");

const app = express();

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
// Must come before any routes
app.use(
  helmet({
    contentSecurityPolicy: false, // handled by Next.js on the frontend
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Stripe Webhook (MUST be before express.json) ──────────────────────────────
// Stripe requires the raw Buffer body to verify the webhook signature.
// We mount the webhook route here with express.raw(), before express.json()
// parses the rest of the requests.
app.use(
  "/api/v1/stripe/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/stripeController").handleWebhook
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ── NoSQL Injection Prevention ────────────────────────────────────────────────
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  next();
});

// ── Global Rate Limiter (applied to all /api/v1 routes) ───────────────────────
app.use("/api/v1", apiLimiter);

// ── Swagger ───────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClipSphere API",
      version: "1.0.0",
      description:
        "Full-stack short-video social platform API. " +
        "Use the Authorize button to paste your JWT token and test protected routes.",
    },
    servers: [{ url: "http://localhost:5000", description: "Local dev server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your JWT token here (without the 'Bearer' prefix)",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id:           { type: "string", example: "664a1b2c3d4e5f6789012345" },
            username:      { type: "string", example: "johndoe" },
            email:         { type: "string", format: "email", example: "john@example.com" },
            role:          { type: "string", enum: ["user", "admin"], example: "user" },
            bio:           { type: "string", example: "I make cooking videos" },
            avatarKey:     { type: "string", example: "avatars/user-123.jpg" },
            active:        { type: "boolean", example: true },
            accountStatus: { type: "string", example: "active" },
            preferences: {
              type: "object",
              properties: {
                inApp: {
                  type: "object",
                  properties: {
                    followers: { type: "boolean" },
                    comments:  { type: "boolean" },
                    likes:     { type: "boolean" },
                    tips:      { type: "boolean" },
                  },
                },
                email: {
                  type: "object",
                  properties: {
                    followers: { type: "boolean" },
                    comments:  { type: "boolean" },
                    likes:     { type: "boolean" },
                    tips:      { type: "boolean" },
                  },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Video: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "664a1b2c3d4e5f6789012345" },
            title:       { type: "string", example: "My cooking tutorial" },
            description: { type: "string", example: "How to make scrambled eggs" },
            owner:       { type: "string", example: "664a1b2c3d4e5f6789012345" },
            videoURL:    { type: "string", example: "videos/clip-123.mp4" },
            duration:    { type: "number", example: 120 },
            viewsCount:  { type: "integer", example: 0 },
            status:      { type: "string", enum: ["public", "private", "flagged"], example: "public" },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id:       { type: "string" },
            rating:    { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment:   { type: "string", example: "Very helpful video!" },
            user:      { type: "string" },
            video:     { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            _id:                  { type: "string" },
            sender:               { type: "string" },
            recipient:            { type: "string" },
            amount:               { type: "number", example: 500, description: "Amount in cents" },
            currency:             { type: "string", example: "usd" },
            stripeSessionId:      { type: "string" },
            stripePaymentIntentId:{ type: "string" },
            status:               { type: "string", enum: ["pending", "completed", "failed"] },
            message:              { type: "string" },
            createdAt:            { type: "string", format: "date-time" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            status:  { type: "string", example: "fail" },
            message: { type: "string", example: "Validation failed" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await initBuckets();
    await connectRedis();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
// Auth routes get their own stricter limiter
app.use("/api/v1/auth",          authLimiter, authRoutes);
app.use("/api/v1/users",         userRoutes);
app.use("/api/v1/users",         followRoutes);
// Upload routes get the upload limiter (applied inside videoRoutes on POST /)
app.use("/api/v1/videos",        videoRoutes);
app.use("/api/v1/videos",        reviewRoutes);
app.use("/api/v1/videos",        likeRoutes);
app.use("/api/v1/admin",         adminRoutes);
app.use("/api/v1/stripe",        stripeRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic server heartbeat
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API running" });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: "fail", message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;