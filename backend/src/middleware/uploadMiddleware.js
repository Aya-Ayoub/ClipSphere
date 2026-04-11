const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// Store uploaded files temporarily on disk before sending to MinIO
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

// Only allow video/mp4 and restrict to 200MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4" || file.mimetype === "video/quicktime") {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 and MOV video files are allowed"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
});

// ffmpeg duration check middleware — runs after multer saves the file
exports.checkDuration = (req, res, next) => {
  if (!req.file) return next();

  ffmpeg.ffprobe(req.file.path, (err, metadata) => {
    if (err) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Could not read video metadata" });
    }

    const duration = metadata.format.duration;

    if (duration > 300) {
      // Delete the file immediately — reject before touching MinIO
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: `Video exceeds 5 minute limit. Your video is ${Math.round(duration)}s`,
      });
    }

    // Attach duration to request so the controller can save it
    req.videoDuration = Math.round(duration);
    next();
  });
};