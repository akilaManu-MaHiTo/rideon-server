const mongoose = require("mongoose");
require("dotenv").config();
const { distributeMonthlyRewards } = require("./services/rewardService");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Example: distribute rewards for September 2025
    const result = await distributeMonthlyRewards(2025, 8); // month = 8 → September
    console.log("Reward distribution result:", result);
    await mongoose.connection.close();
  })
  .catch(err => console.error(err));
