const mongoose = require("mongoose");

const bikeStationSchema = new mongoose.Schema(
  {
    stationName: { type: String, required: true },
    stationId: { type: String, required: true },
    stationLocation: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BikeStation", bikeStationSchema);
