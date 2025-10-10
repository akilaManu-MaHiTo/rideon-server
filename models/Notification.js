const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["system", "payment", "rental", "package", "accident", "incident", "general"],
      default: "general",
    },
  },
  { 
    timestamps: true
  }
);

// Index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);