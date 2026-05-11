// PERSON B
const { Queue } = require("bullmq");

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
};

// Email notification queue
const emailQueue = new Queue("email-notifications", { connection });

// Video processing queue (metadata, duration checks)
const videoQueue = new Queue("video-processing", { connection });

console.log("[Bull] Queues initialised — email-notifications, video-processing");

module.exports = { emailQueue, videoQueue, connection };