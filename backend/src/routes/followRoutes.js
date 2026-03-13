const express = require("express");
const controller = require("../controllers/followController");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/:id/follow",protect,controller.followUser);

router.delete("/:id/unfollow",protect,controller.unfollowUser);

router.get("/:id/followers",controller.getFollowers);

router.get("/:id/following",controller.getFollowing);

module.exports = router;