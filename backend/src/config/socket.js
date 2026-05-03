const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

/**
 * Initialize Socket.io and attach it to the existing HTTP server.
 * Each authenticated user is placed into their own private room (their userId).
 * This ensures notifications are routed only to the correct recipient.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── JWT Authentication Middleware ─────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.active) {
        return next(new Error("Authentication error: User not found or banned"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ── Connection Handler ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Join the user's private room so we can emit directly to them
    socket.join(userId);
    console.log(`[Socket] User ${userId} connected → joined room`);

    // Client signals it has viewed its notifications → clear badge
    socket.on("mark_notifications_read", () => {
      socket.emit("badge_cleared");
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] User ${userId} disconnected — ${reason}`);
    });
  });

  return io;
};

/**
 * Returns the active Socket.io instance.
 * Must be called after initSocket().
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialised. Call initSocket(httpServer) first.");
  }
  return io;
};

module.exports = { initSocket, getIO };