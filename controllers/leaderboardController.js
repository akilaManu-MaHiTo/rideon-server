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
    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      match.createdAt = { $gte: start };
    } else if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      match.createdAt = { $gte: start };
    } else if (period === "day") {
      const start = new Date(now);
      start.setDate(now.getDate() - 1);
      match.createdAt = { $gte: start };
    }

    // Aggregate total rcPrice spent per user
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
          userId: "$_id",
          totalRCSpent: 1,
          rides: 1,
          userName: "$user.userName",
          email: "$user.email",
        },
      },
      { $skip: (pageNum - 1) * lim },
      { $limit: lim },
    ];

    const results = await RentBike.aggregate(agg);

    // If includeRankFor is provided, compute that user's rank across the same period
    let userRank = null;
    if (includeRankFor) {
      // Compute rank by counting users with greater totalRCSpent
      const rankAgg = [
        { $match: match },
        {
          $group: {
            _id: "$userId",
            totalRCSpent: { $sum: "$rcPrice" },
          },
        },
        { $sort: { totalRCSpent: -1 } },
      ];
      const all = await RentBike.aggregate(rankAgg);
      const idx = all.findIndex((r) => String(r._id) === String(includeRankFor));
      if (idx !== -1) userRank = { userId: includeRankFor, rank: idx + 1, totalRCSpent: all[idx].totalRCSpent };
      else userRank = { userId: includeRankFor, rank: null, totalRCSpent: 0 };
    }

    res.json({ page: pageNum, limit: lim, data: results, includeRankFor: userRank });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
