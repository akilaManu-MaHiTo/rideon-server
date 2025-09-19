const mongoose = require("mongoose");

const bikesSchema = new mongoose.Schema(
    {
  bikeId: { type: String, required: true },
  bikeModel: { type: String, required: true },
  fuelType: { type: String, required: true },
  distance: { type: Number, required: true },
  condition: { type: Number, required: true },
},
{ timestamps: true });

module.exports = mongoose.model("Bike", bikesSchema);