// PERSON B
// ── Worker Process ────────────────────────────────────────────────────────────
// This runs as a SEPARATE container (or process) from the main API.
// It processes background jobs from the Redis queue:
//   - Email notifications
//   - Video metadata processing
//
// In docker-compose.yml this is the "worker" service which uses the same
// backend image but overrides the CMD to run this file instead of server.js

require("dotenv").config();
const mongoose = require("mongoose");

const { connectRedis }    = require("./src/config/redis");
const { startEmailWorker } = require("./src/services/emailQueue");

const start = async () => {
  // Connect to MongoDB (worker needs DB access to fetch user data for emails)
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[Worker] MongoDB connected");

  // Connect to Redis
  await connectRedis();
  console.log("[Worker] Redis connected");

  // Start all workers
  startEmailWorker();
  

  console.log("[Worker] All workers running. Waiting for jobs...");
};

start().catch((err) => {
  console.error("[Worker] Failed to start:", err);
  process.exit(1);
});