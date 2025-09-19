// models/Package.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rc: { type: String, required: true },
    price: { type: String, required: true },
    recommended: { type: Boolean, default: false },
    description: { type: String, required: true },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: false } 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
