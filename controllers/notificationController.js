const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Private (Admin or System)
 */
exports.createNotification = async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type,
      category,
      priority,
      relatedEntityType,
      relatedEntityId,
      actionUrl,
      expiresAt,
      scheduledFor,
      metadata
    } = req.body;

    // Validate required fields
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and message are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create notification
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      category,
      priority,
      relatedEntityType,
      relatedEntityId,
      actionUrl,
      expiresAt,
      scheduledFor,
      metadata
    });

    await notification.save();

    // Populate user data
    await notification.populate('userId', 'userName email');

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Get all notifications with filtering and pagination
 * @route   GET /api/notifications
 * @access  Private (Admin)
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      type,
      category,
      isRead,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .populate('userId', 'userName email')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / parseInt(limit));

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalNotifications,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Get all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications/my-notifications
 * @access  Private (User)
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      type,
      category,
      isRead,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { userId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;

    // Don't show expired notifications unless specifically requested
    if (req.query.includeExpired !== 'true') {
      filter.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / parseInt(limit));

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalNotifications,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Get my notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id).populate('userId', 'userName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Check if user has permission to view this notification
    if (userRole !== 'Admin' && notification.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Get notification by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Update notification
 * @route   PUT /api/notifications/:id
 * @access  Private (Admin or Owner)
 */
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Check permissions
    if (userRole !== 'Admin' && notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const allowedUpdates = [
      'title', 'message', 'type', 'category', 'priority',
      'relatedEntityType', 'relatedEntityId', 'actionUrl',
      'expiresAt', 'scheduledFor', 'metadata'
    ];

    // If user is not admin, limit what they can update
    if (userRole !== 'Admin') {
      const userAllowedUpdates = ['isRead'];
      Object.keys(req.body).forEach(key => {
        if (!userAllowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    }

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update) || update === 'isRead'
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates"
      });
    }

    updates.forEach(update => {
      notification[update] = req.body[update];
    });

    await notification.save();
    await notification.populate('userId', 'userName email');

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification
    });
  } catch (error) {
    console.error("Update notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Check permissions
    if (userRole !== 'Admin' && notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Admin or Owner)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Check permissions
    if (userRole !== 'Admin' && notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Delete multiple notifications
 * @route   DELETE /api/notifications/bulk-delete
 * @access  Private
 */
exports.bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Notification IDs array is required"
      });
    }

    let filter = { _id: { $in: notificationIds } };

    // If not admin, only allow deletion of own notifications
    if (userRole !== 'Admin') {
      filter.userId = userId;
    }

    const result = await Notification.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted successfully`
    });
  } catch (error) {
    console.error("Bulk delete notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  Private (Admin)
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let matchStage = {};
    if (userRole !== 'Admin') {
      matchStage.userId = userId;
    }

    const stats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          unreadNotifications: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
          },
          readNotifications: {
            $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] }
          },
          highPriorityNotifications: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
          },
          urgentNotifications: {
            $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] }
          }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalNotifications: 0,
          unreadNotifications: 0,
          readNotifications: 0,
          highPriorityNotifications: 0,
          urgentNotifications: 0
        },
        byType: typeStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};