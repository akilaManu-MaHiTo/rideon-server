const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getLeaderboard } = require("../controllers/leaderboardController");

// Public leaderboard - can be protected if you want only authenticated users to view
router.get("/", /*protect,*/ getLeaderboard);

module.exports = router;
