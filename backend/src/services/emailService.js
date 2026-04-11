const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Welcome email sent on registration
exports.sendWelcomeEmail = async (toEmail, username) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: "Welcome to ClipSphere! 🎬",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Welcome to ClipSphere, ${username}! 🎬</h1>
          <p>We're excited to have you on board.</p>
          <p>Start exploring videos, follow creators, and share your own clips!</p>
          <a href="http://localhost:3000" 
             style="background: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
            Get Started
          </a>
          <p style="color: #888; margin-top: 32px; font-size: 12px;">
            You're receiving this because you just created a ClipSphere account.
          </p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (err) {
    // Don't crash the app if email fails — just log it
    console.error("Failed to send welcome email:", err.message);
  }
};

// New engagement alert (follow, like, comment, tip)
exports.sendEngagementEmail = async (toEmail, username, type, actorName) => {
  const messages = {
    follow: `${actorName} started following you!`,
    like: `${actorName} liked your video!`,
    comment: `${actorName} commented on your video!`,
    tip: `${actorName} sent you a tip!`,
  };

  const message = messages[type] || "You have a new notification on ClipSphere!";

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `New activity on ClipSphere 🔔`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Hey ${username}! 👋</h2>
          <p style="font-size: 16px;">${message}</p>
          <a href="http://localhost:3000" 
             style="background: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
            View on ClipSphere
          </a>
          <p style="color: #888; margin-top: 32px; font-size: 12px;">
            You can manage your notification preferences in your settings.
          </p>
        </div>
      `,
    });
    console.log(`Engagement email (${type}) sent to ${toEmail}`);
  } catch (err) {
    console.error("Failed to send engagement email:", err.message);
  }
};