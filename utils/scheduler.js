const cron = require("node-cron");
const UserPackage = require("../models/UserPackage");
const { cleanupExpiredNotifications } = require("./notificationHelper");

// Clean up expired user packages daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await UserPackage.deleteMany({ expiresAt: { $lt: now } });
    console.log(`[CRON] ${result.deletedCount} expired packages removed at ${now.toISOString()}`);
  } catch (err) {
    console.error("CRON error:", err.message);
  }
});

// Clean up expired notifications daily at 1 AM
cron.schedule("0 1 * * *", async () => {
  try {
    const now = new Date();
    await cleanupExpiredNotifications();
    console.log(`[CRON] Expired notifications cleanup completed at ${now.toISOString()}`);
  } catch (err) {
    console.error("CRON notification cleanup error:", err.message);
  }
});
