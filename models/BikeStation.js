const mongoose = require("mongoose");

const bikeStationSchema = new mongoose.Schema(
  {
    stationName: { type: String, required: true },
    stationId: { type: String, required: true },
    stationLocation: { type: String, required: true },
    bikeCount: { type: Number, required: true },
    bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bike" }],
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BikeStation", bikeStationSchema);
