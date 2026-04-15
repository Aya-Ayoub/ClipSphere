const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// -----------------------------
// FFmpeg setup (KEEP ONLY ONE PATH)
// -----------------------------
const ffmpegPath =
  "C:\\Users\\nw205\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";

const ffprobePath =
  "C:\\Users\\nw205\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffprobe.exe";

// Set only ONCE (remove conflicting overrides)
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Debug (important for your case)
console.log("FFMPEG EXISTS:", fs.existsSync(ffmpegPath));
console.log("FFPROBE EXISTS:", fs.existsSync(ffprobePath));

// -----------------------------
// Multer storage
// -----------------------------
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

// -----------------------------
// File filter
// -----------------------------
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
  limits: { fileSize: 200 * 1024 * 1024 },
});

// -----------------------------
// ffprobe duration check
// -----------------------------
exports.checkDuration = (req, res, next) => {
  if (!req.file) {
    console.log("No file — skipping duration check");
    return next();
  }

  console.log("FILE:", req.file.path);

  ffmpeg.ffprobe(req.file.path, (err, metadata) => {
    if (err) {
      console.error("FFPROBE ERROR:", err.message);

      try {
        fs.unlinkSync(req.file.path);
      } catch {}

      return res.status(400).json({
        message: "Could not read video metadata (ffprobe failed)",
      });
    }

    const duration = metadata.format.duration;
    console.log("Detected duration:", duration);

    if (duration > 300) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: `Video exceeds 5 minute limit. Your video is ${Math.round(duration)}s`,
      });
    }

    req.videoDuration = Math.round(duration);
    console.log("Set req.videoDuration:", req.videoDuration);

    next();
  });
};