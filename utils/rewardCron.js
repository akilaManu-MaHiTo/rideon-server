const mongoose = require("mongoose");
require("dotenv").config();
const cron = require("node-cron");
const { distributeMonthlyRewards, cleanupOldRewards } = require("../services/rewardService");

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");

    //  Monthly distribution: 00:01 on the 1st of each month
    cron.schedule("1 0 1 * *", async () => {
      console.log("Running monthly leaderboard reward distribution...");
      const result = await distributeMonthlyRewards();
      console.log("Reward distribution result:", result);
    });
// 0 1 * *
    //  Cleanup old rewards: 01:00 on the 1st of each month
    cron.schedule("0 1 1 * *", async () => {
      console.log("Running reward log cleanup...");
      await cleanupOldRewards();
    });

  })
  .catch(err => console.error("MongoDB connection error:", err));
