const mongoose = require("mongoose");

const monthlyRewardSchema = new mongoose.Schema({
  month: { type: String, required: true }, // Format: YYYY-MM
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rank: { type: Number, required: true },
  rewardRC: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MonthlyReward", monthlyRewardSchema);
