const mongoose = require("mongoose");

const obstacleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: Number, required: true },
    isShow: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Obstacle", obstacleSchema);
