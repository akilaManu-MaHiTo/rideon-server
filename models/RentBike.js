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
  },
  { timestamps: true }
);

module.exports = mongoose.model("rentBike", rentBikeSchema);
