const mongoose = require("mongoose");

const rentBikeSchema = new mongoose.Schema(
  {
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
      required: true,
    },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    rcPrice: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BikeStation",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
rentBikeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("rentBike", rentBikeSchema);
