// PERSON B
// Email Queue Processor — runs in the worker process
// This keeps email sending off the main API thread so uploads/requests stay fast

const { Worker } = require("bullmq");
const nodemailer  = require("nodemailer");
const User        = require("../models/User");
const { connection } = require("../config/bull");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Adds an email job to the queue.
 * Called from notificationService instead of sending directly.
 */
const queueEmail = async (emailQueue, { recipientId, senderId, type, videoTitle = "" }) => {
    console.log("[queueEmail] Adding job to queue:", type, recipientId);
    await emailQueue.add(
    "send-engagement-email",
    { recipientId, senderId, type, videoTitle },
    {
      attempts: 3,           // retry up to 3 times on failure
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100, // keep last 100 completed jobs
      removeOnFail: 50,
    }
  );
};

/**
 * Starts the email worker — only called from worker.js, not server.js.
 * This way email processing runs in a separate container/process.
 */
const startEmailWorker = () => {
  const worker = new Worker(
    "email-notifications",
    async (job) => {
      const { recipientId, senderId, type, videoTitle } = job.data;

      const [recipient, sender] = await Promise.all([
        User.findById(recipientId).select("email username preferences"),
        User.findById(senderId).select("username"),
      ]);

      if (!recipient || !sender) return;

      // Respect email preferences
      const emailAllowed = recipient.preferences?.email?.[type] ?? true;
      if (!emailAllowed) {
        console.log(`[EmailWorker] Email suppressed for ${recipient.email} — ${type} disabled`);
        return;
      }

      const subjects = {
        like:    `@${sender.username} liked your video`,
        follow:  `@${sender.username} started following you`,
        comment: `@${sender.username} commented on your video`,
        tip:     `You received a tip from @${sender.username}`,
      };

      await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      recipient.email,
        subject: subjects[type] || "New activity on ClipSphere",
        html: `
          <div style="font-family:sans-serif;background:#09090b;color:#fff;padding:32px">
            <h2 style="color:#6366f1">ClipSphere</h2>
            <p>${subjects[type] || "You have a new notification."}</p>
            ${videoTitle ? `<p style="color:#a1a1aa">Video: "${videoTitle}"</p>` : ""}
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}"
               style="display:inline-block;background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:16px">
              View on ClipSphere
            </a>
          </div>
        `,
      });

      console.log(`[EmailWorker] Email sent to ${recipient.email} — type: ${type}`);
    },
    { connection }
  );

  worker.on("completed", (job) => console.log(`[EmailWorker] Job ${job.id} completed`));
  worker.on("failed",    (job, err) => console.error(`[EmailWorker] Job ${job.id} failed:`, err.message));

  console.log("[EmailWorker] Email worker started and listening for jobs");
  return worker;
};

module.exports = { queueEmail, startEmailWorker };