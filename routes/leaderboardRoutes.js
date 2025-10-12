const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getLeaderboard, getUserRank} = require("../controllers/leaderboardController");

// Public leaderboard - can be protected if you want only authenticated users to view
router.get("/", /*protect,*/ getLeaderboard);
router.get("/my-rank", protect, getUserRank);;

module.exports = router;
