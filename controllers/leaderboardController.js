const RentBike = require("../models/RentBike");
const User = require("../models/User");

/**
 * GET /api/leaderboard
 * Query params:
 * - period: 'all' (default) | 'month' | 'week' | 'day'
 * - page, limit: pagination
 * - includeRankFor: userId (optional) - returns rank for a specific user
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = "all", page = 1, limit = 20, includeRankFor } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, Math.min(100, parseInt(limit)));

    const match = {};
    const now = new Date();

    // Apply period filter with both start and end bounds
    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      match.createdAt = { $gte: start, $lt: end };
    } else if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      match.createdAt = { $gte: start, $lt: end };
    } else if (period === "day") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      match.createdAt = { $gte: start, $lt: end };
    }

    // Aggregate leaderboard grouped by userId
    const agg = [
      { $match: match },
      {
        $group: {
          _id: "$userId",
          totalRCSpent: { $sum: "$rcPrice" },
          rides: { $sum: 1 },
        },
      },
      { $sort: { totalRCSpent: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id",
          totalRCSpent: 1,
          rides: 1,
          userId: "$_id",
          userName: "$user.userName",
          email: "$user.email",
        },
      },
      { $skip: (pageNum - 1) * lim },
      { $limit: lim },
    ];

    const results = await RentBike.aggregate(agg);

    // Determine which user to include rank for: query param `includeRankFor` takes precedence
    const rankTarget = includeRankFor || (req.user && req.user.id) || null;
    let includeRankForObj = null;

    if (rankTarget) {
      const rankAgg = [
        { $match: match },
        { $group: { _id: "$userId", totalRCSpent: { $sum: "$rcPrice" } } },
        { $sort: { totalRCSpent: -1 } },
      ];

      const all = await RentBike.aggregate(rankAgg);
      const idx = all.findIndex((r) => String(r._id) === String(rankTarget));

      includeRankForObj = {
        userId: rankTarget,
        rank: idx !== -1 ? idx + 1 : null,
        totalRCSpent: idx !== -1 ? all[idx].totalRCSpent : 0,
      };
    }

    res.json({ page: pageNum, limit: lim, data: results, includeRankFor: includeRankForObj });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @desc    Get user's rank based on total RC spent
 * @route   GET /api/leaderboard/my-rank
 * @access  Private (User)
 */
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.user.id; 

    // Aggregate total RC spent per user
    const rankAgg = [
      {
        $group: {
          _id: "$userId",
          totalRCSpent: { $sum: "$rcPrice" },
        },
      },
      { $sort: { totalRCSpent: -1 } },
    ];

    const all = await RentBike.aggregate(rankAgg);
    const idx = all.findIndex((r) => String(r._id) === String(userId));

    if (idx === -1) {
      return res.status(200).json({
        success: true,
        message: "User has no rides or RC spend data yet",
        data: {
          userId,
          rank: null,
          totalRCSpent: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "User rank fetched successfully",
      data: {
        userId,
        rank: idx + 1,
        totalRCSpent: all[idx].totalRCSpent,
      },
    });
  } catch (err) {
    console.error("getUserRank error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user rank",
      error: err.message,
    });
  }
};
