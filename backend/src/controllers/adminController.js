const adminService = require("../services/adminService");

//try/catch so globalErrorHandler can catch errors
exports.getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ status: "success", data: stats });
  } catch (err) {
    next(err);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await adminService.banUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });
    //hide password from response
    user.password = undefined;
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

exports.getModerationQueue = async (req, res, next) => {
  try {
    const videos = await adminService.getFlaggedVideos();
    res.status(200).json({ status: "success", results: videos.length, data: videos });
  } catch (err) {
    next(err);
  }
};

exports.healthCheck = async (req, res, next) => {
  try {
    const mongoose = require("mongoose");
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(200).json({
      status: "success",
      data: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: dbStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};