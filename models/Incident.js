const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    incidentType: { type: String, required: true },
    howSerious: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stopRide: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);
