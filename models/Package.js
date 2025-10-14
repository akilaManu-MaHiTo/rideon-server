const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rc: { type: Number, required: true },
    price: { type: Number, required: true },
    recommended: { type: Boolean, default: false },
    description: { type: String, required: true },
    icon: { type: String, default: '', required: true },
    timePeriod: { type: Number, required: true, default: 365 } // in days
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
