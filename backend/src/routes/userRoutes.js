const express = require("express");
const controller = require("../controllers/userController");
const protect = require("../middleware/protect");

const router = express.Router();

router.get("/me",protect,controller.getMe);

router.patch("/updateMe",protect,controller.updateMe);

router.get("/:id",controller.getUser);

module.exports = router;