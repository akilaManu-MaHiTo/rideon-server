const cron = require("node-cron");
const { distributeMonthlyRewards, cleanupOldRewards } = require("../services/rewardService");

let initialized = false;
const scheduledTasks = [];

function initializeRewardCron(options = {}) {
  if (initialized) {
    return scheduledTasks;
  }

  initialized = true;

  const runOnStart = options.runOnStart ?? process.env.REWARD_CRON_RUN_ON_START === "true";

  const monthlyDistributionTask = cron.schedule("1 0 1 * *", async () => {
    console.log("Running monthly leaderboard reward distribution...");
    const result = await distributeMonthlyRewards();
    console.log("Reward distribution result:", result);
  });

  const cleanupTask = cron.schedule("0 1 1 1 *", async () => {
    console.log("Running reward log cleanup...");
    await cleanupOldRewards();
  });

  scheduledTasks.push(monthlyDistributionTask, cleanupTask);

  if (runOnStart) {
    // Helpful during development to verify the handlers without waiting a month.
    monthlyDistributionTask.fireOnTick();
    cleanupTask.fireOnTick();
  }

  return scheduledTasks;
}

module.exports = { initializeRewardCron };
