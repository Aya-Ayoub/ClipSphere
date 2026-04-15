const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const followRoutes = require("./routes/followRoutes");
const videoRoutes = require("./routes/videoRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { initBuckets } = require("./config/minio");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const likeRoutes = require("./routes/likeRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  next();
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClipSphere API",
      version: "1.0.0",
      description:
        "Full-stack short-video social platform API. " +
        "Use the Authorize button to paste your JWT token and test protected routes."
    },
    servers: [{ url: "http://localhost:5000", description: "Local dev server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your JWT token here (without the 'Bearer' prefix)"
        }
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
                    tips:      { type: "boolean" }
                  }
                },
                email: {
                  type: "object",
                  properties: {
                    followers: { type: "boolean" },
                    comments:  { type: "boolean" },
                    likes:     { type: "boolean" },
                    tips:      { type: "boolean" }
                  }
                }
              }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Video: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "664a1b2c3d4e5f6789012345" },
            title:       { type: "string", example: "My cooking tutorial" },
            description: { type: "string", example: "How to make scrambled eggs" },
            owner:       { type: "string", example: "664a1b2c3d4e5f6789012345" },
            videoURL:    { type: "string", example: "videos/clip-123.mp4" },
            duration:    { type: "number", example: 120, description: "Duration in seconds (max 300)" },
            viewsCount:  { type: "integer", example: 0 },
            status:      { type: "string", enum: ["public", "private", "flagged"], example: "public" },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" }
          }
        },
        Review: {
          type: "object",
          properties: {
            _id:       { type: "string" },
            rating:    { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment:   { type: "string", example: "Very helpful video!" },
            user:      { type: "string", example: "664a1b2c3d4e5f6789012345" },
            video:     { type: "string", example: "664a1b2c3d4e5f6789012345" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        ValidationError: {
          type: "object",
          properties: {
            status:  { type: "string", example: "fail" },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field:   { type: "string", example: "email" },
                  message: { type: "string", example: "Please provide a valid email address" }
                }
              }
            }
          }
        }
      }
    }
  },
  // Scan all route files for @swagger comments
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await initBuckets();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/v1/auth",   authRoutes);
app.use("/api/v1/users",  userRoutes);
app.use("/api/v1/users",  followRoutes);   // follow/unfollow/followers/following
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/videos", reviewRoutes);   // POST /api/v1/videos/:id/reviews
app.use("/api/v1/admin",  adminRoutes);
app.use("/api/v1/videos", likeRoutes);

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic server heartbeat
 *     description: Returns 200 if the server is running. No auth required.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: API running
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API running" });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ status: "fail", message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler (must be last)
app.use(globalErrorHandler);

module.exports = app;