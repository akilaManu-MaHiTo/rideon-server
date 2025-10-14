const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMyRewards } = require("../controllers/rewardController");

// Protected route
router.get("/", protect, getMyRewards);

module.exports = router;
