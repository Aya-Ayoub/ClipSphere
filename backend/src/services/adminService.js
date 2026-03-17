const User = require("../models/User");
const Video = require("../models/Video");

exports.getStats = async () => {
  const [userCount, videoCount, mostActive] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),

    //most Active users of the week
    Video.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: "$owner", videoCount: { $sum: 1 } } },
      { $sort: { videoCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$user.username",
          videoCount: 1
        }
      }
    ])
  ]);

  return {
    totalUsers: userCount,
    totalVideos: videoCount,
    totalTips: 0,
    mostActiveUsersThisWeek: mostActive
  };
};

exports.banUser = async (id, body) => {
  const active = body.active !== undefined ? body.active : false;
  const accountStatus = active ? "active" : "banned";

  return await User.findByIdAndUpdate(
    id,
    { active, accountStatus },
    { new: true, runValidators: true }
  );
};

exports.getFlaggedVideos = async () => {
  return await Video.find({ status: "flagged" })
    .populate("owner", "username email")
    .sort({ createdAt: -1 });
};