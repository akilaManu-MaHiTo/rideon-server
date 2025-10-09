const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isRented: {type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accident", accidentSchema);
