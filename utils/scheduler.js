const cron = require("node-cron");
const UserPackage = require("../models/UserPackage");

cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await UserPackage.deleteMany({ expiresAt: { $lt: now } });
    console.log(`[CRON] ${result.deletedCount} expired packages removed at ${now.toISOString()}`);
  } catch (err) {
    console.error("CRON error:", err.message);
  }
});
