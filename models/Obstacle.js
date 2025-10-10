const mongoose = require("mongoose");

const obstacleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    isShow: { type: Boolean, default: false },
    obstacleLatitude: { type: Number, required: true },
    obstacleLongitude: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Obstacle", obstacleSchema);
