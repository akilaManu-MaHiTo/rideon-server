const RentBike = require("../models/RentBike");
const User = require("../models/User");
const MonthlyReward = require("../models/MonthlyReward");

/**
 * Distribute monthly rewards
 * @param {Number} year - full year, e.g., 2025 (optional, defaults to last month)
 * @param {Number} month - 0-11 for month index (optional, defaults to last month)
 */
async function distributeMonthlyRewards(year, month) {
  try {
    const now = new Date();

    // Determine target month
    if (year == null || month == null) {
      // Defaults to last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      year = lastMonth.getFullYear();
      month = lastMonth.getMonth();
    }

    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 1, 0, 0, 0);

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; // e.g., 2025-09

    console.log("Distributing rewards for month:", monthKey);
    console.log("Start date:", start.toString());
    console.log("End date:", end.toString());

    // Skip if already distributed
    const alreadyDistributed = await MonthlyReward.findOne({ month: monthKey });
    if (alreadyDistributed) {
      console.log(`Rewards for ${monthKey} already distributed.`);
      return [];
    }

    // Count rentals
    const rentalCount = await RentBike.countDocuments({ createdAt: { $gte: start, $lt: end } });
    console.log(`Rentals found in period: ${rentalCount}`);
    if (rentalCount === 0) {
      console.log("No rentals found. Skipping rewards.");
      return [];
    }

    // Aggregate top 10 users
    const topUsers = await RentBike.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$userId", totalRCSpent: { $sum: "$rcPrice" } } },
      { $sort: { totalRCSpent: -1 } },
      { $limit: 10 },
    ]);

    const rewardMapping = [50, 40, 30]; // 1st-3rd
    const defaultReward = 15;           // 4th-10th
    const summary = [];

    for (let i = 0; i < topUsers.length; i++) {
      const userId = topUsers[i]._id;
      const rank = i + 1;
      const rewardRC = rewardMapping[i] || defaultReward;

      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { rc: rewardRC } },
        { new: true }
      );

      if (!user) continue;

      await MonthlyReward.create({ month: monthKey, userId, rank, rewardRC });

      summary.push({
        userId: user._id,
        name: user.userName,
        rank,
        rewardRC,
        totalRC: user.rc,
      });

      console.log(`Rewarded ${user.userName} (${user._id}) with ${rewardRC} RC (Rank: ${rank})`);
    }

    console.log(`Monthly rewards for ${monthKey} distributed successfully.`);
    return summary;

  } catch (err) {
    console.error("Error in distributeMonthlyRewards:", err);
    return [];
  }
}
  /**
 * Delete reward logs older than 1 year
 */
async function cleanupOldRewards() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const deleted = await MonthlyReward.deleteMany({ createdAt: { $lt: oneYearAgo } });
    console.log(`Deleted ${deleted.deletedCount} old reward logs`);
    return deleted.deletedCount;
  } catch (err) {
    console.error("Error in cleanupOldRewards:", err);
    return 0;
  }
}

module.exports = { distributeMonthlyRewards, cleanupOldRewards };

// const RentBike = require("../models/RentBike");
// const User = require("../models/User");
// const MonthlyReward = require("../models/MonthlyReward");

// /**
//  * Distribute monthly rewards for CURRENT month
//  */
// async function distributeMonthlyRewards() {
//   try {
//     const now = new Date();

//     // Current month (local time)
//     const year = now.getFullYear();
//     const month = now.getMonth(); // 0-11

//     const start = new Date(year, month, 1, 0, 0, 0);      // 1st day of current month
//     const end = new Date(year, month + 1, 1, 0, 0, 0);    // 1st day of next month

//     const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; // e.g., 2025-10

//     console.log("Distributing rewards for month:", monthKey);
//     console.log("Start date:", start.toString());
//     console.log("End date:", end.toString());

//     // Skip if already distributed
//     const alreadyDistributed = await MonthlyReward.findOne({ month: monthKey });
//     if (alreadyDistributed) {
//       console.log(`Rewards for ${monthKey} already distributed.`);
//       return [];
//     }

//     // Count rentals in this month
//     const rentalCount = await RentBike.countDocuments({ createdAt: { $gte: start, $lt: end } });
//     console.log(`Rentals found in period: ${rentalCount}`);
//     if (rentalCount === 0) {
//       console.log("No rentals found. Skipping rewards.");
//       return [];
//     }

//     // Aggregate top 10 users by RC spent
//     const topUsers = await RentBike.aggregate([
//       { $match: { createdAt: { $gte: start, $lt: end } } },
//       { $group: { _id: "$userId", totalRCSpent: { $sum: "$rcPrice" } } },
//       { $sort: { totalRCSpent: -1 } },
//       { $limit: 10 },
//     ]);

//     const rewardMapping = [50, 40, 30]; // 1st-3rd
//     const defaultReward = 15;           // 4th-10th
//     const summary = [];

//     for (let i = 0; i < topUsers.length; i++) {
//       const userId = topUsers[i]._id;
//       const rank = i + 1;
//       const rewardRC = rewardMapping[i] || defaultReward;

//       const user = await User.findByIdAndUpdate(
//         userId,
//         { $inc: { rc: rewardRC } },
//         { new: true }
//       );

//       if (!user) continue;

//       await MonthlyReward.create({ month: monthKey, userId, rank, rewardRC });

//       summary.push({
//         userId: user._id,
//         name: user.userName,
//         rank,
//         rewardRC,
//         totalRC: user.rc,
//       });

//       console.log(`Rewarded ${user.userName} (${user._id}) with ${rewardRC} RC (Rank: ${rank})`);
//     }

//     console.log(`Monthly rewards for ${monthKey} distributed successfully.`);
//     return summary;

//   } catch (err) {
//     console.error("Error in distributeMonthlyRewards:", err);
//     return [];
//   }
// }

// module.exports = { distributeMonthlyRewards };
