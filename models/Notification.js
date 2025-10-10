const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "reminder", "promotion"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["system", "payment", "rental", "package", "accident", "incident", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    relatedEntityType: {
      type: String,
      enum: ["bike", "rental", "package", "payment", "accident", "incident"],
      required: false,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    actionUrl: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if notification is scheduled for future
notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor && this.scheduledFor > new Date();
});

// Index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set sentAt when notification is created
notificationSchema.pre('save', function(next) {
  if (this.isNew && this.scheduledFor <= new Date()) {
    this.sentAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);