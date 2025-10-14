const MonthlyReward = require("../models/MonthlyReward");

/**
 * GET /api/rewards/my
 * Fetch logged-in user's monthly rewards
 */
exports.getMyRewards = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT token
    const rewards = await MonthlyReward.find({ userId }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (err) {
    console.error("getMyRewards error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
