const express    = require("express");
const controller = require("../controllers/LikeController");
const protect    = require("../middleware/protect");

const router = express.Router({ mergeParams: true });

router.get("/:id/like", protect, controller.getLikes);
router.post("/:id/like", protect, controller.likeVideo);
router.delete("/:id/like", protect, controller.unlikeVideo);
module.exports = router;