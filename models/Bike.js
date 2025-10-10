const e = require("cors");
const mongoose = require("mongoose");

const bikesSchema = new mongoose.Schema(
    {
  bikeId: { type: String, required: true },
  bikeModel: { type: String, required: true },
  imageUrl: { type: String },
  fuelType: { type: String, required: true, enum: ["pedal", "electric"] },
  distance: { type: Number, required: true },
  condition: { type: Number, required: true },
  availability: { type: Boolean, required: true, default: true },
  assigned: { type: Boolean, required: true, default: false },
  rentApproved: { type: Boolean, required: true, default: false },
  rentRejected: { type: Boolean, required: true, default: false },
  userAggrement: { type: Boolean, required: true, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},
{ timestamps: true });

module.exports = mongoose.model("Bike", bikesSchema);