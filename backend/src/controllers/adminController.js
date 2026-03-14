const adminService = require("../services/adminService");

exports.getStats = async (req, res) => {

  const stats = await adminService.getStats();

  res.json(stats);

};

exports.banUser = async (req, res) => {

  const user = await adminService.banUser(req.params.id);

  res.json(user);

};

exports.getModerationQueue = async (req, res) => {

  const videos = await adminService.getFlaggedVideos();

  res.json(videos);

};

exports.healthCheck = async (req,res)=>{

  res.json({
    uptime:process.uptime(),
    memory:process.memoryUsage(),
    database:"connected"
  });

};