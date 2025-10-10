const Notification = require("../models/Notification");

/**
 * Create a notification helper function
 * @param {Object} notificationData - The notification data
 * @param {String} notificationData.userId - User ID to send notification to
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} [notificationData.type] - Notification type (info, success, warning, error, reminder, promotion)
 * @param {String} [notificationData.category] - Notification category (system, payment, rental, package, accident, incident, general)
 * @param {String} [notificationData.priority] - Notification priority (low, medium, high, urgent)
 * @param {String} [notificationData.relatedEntityType] - Related entity type
 * @param {String} [notificationData.relatedEntityId] - Related entity ID
 * @param {String} [notificationData.actionUrl] - Action URL for the notification
 * @param {Date} [notificationData.expiresAt] - Expiration date
 * @param {Date} [notificationData.scheduledFor] - Scheduled delivery date
 * @param {Object} [notificationData.metadata] - Additional metadata
 * @returns {Promise<Object>} The created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      category: notificationData.category || 'general',
      priority: notificationData.priority || 'medium',
      relatedEntityType: notificationData.relatedEntityType,
      relatedEntityId: notificationData.relatedEntityId,
      actionUrl: notificationData.actionUrl,
      expiresAt: notificationData.expiresAt,
      scheduledFor: notificationData.scheduledFor || new Date(),
      metadata: notificationData.metadata || {}
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notification for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - The notification data (same as createNotification but without userId)
 * @returns {Promise<Array>} Array of created notifications
 */
const createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      category: notificationData.category || 'general',
      priority: notificationData.priority || 'medium',
      relatedEntityType: notificationData.relatedEntityType,
      relatedEntityId: notificationData.relatedEntityId,
      actionUrl: notificationData.actionUrl,
      expiresAt: notificationData.expiresAt,
      scheduledFor: notificationData.scheduledFor || new Date(),
      metadata: notificationData.metadata || {}
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Create system notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} [priority] - Priority level
 * @returns {Promise<Object>} The created notification
 */
const createSystemNotification = async (userId, title, message, priority = 'medium') => {
  return createNotification({
    userId,
    title,
    message,
    type: 'info',
    category: 'system',
    priority
  });
};

/**
 * Create payment notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type (success, error, warning)
 * @param {String} [paymentId] - Related payment ID
 * @returns {Promise<Object>} The created notification
 */
const createPaymentNotification = async (userId, title, message, type = 'success', paymentId = null) => {
  return createNotification({
    userId,
    title,
    message,
    type,
    category: 'payment',
    priority: 'high',
    relatedEntityType: 'payment',
    relatedEntityId: paymentId
  });
};

/**
 * Create rental notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {String} [rentalId] - Related rental ID
 * @returns {Promise<Object>} The created notification
 */
const createRentalNotification = async (userId, title, message, type = 'info', rentalId = null) => {
  return createNotification({
    userId,
    title,
    message,
    type,
    category: 'rental',
    priority: 'medium',
    relatedEntityType: 'rental',
    relatedEntityId: rentalId
  });
};

/**
 * Create package notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {String} [packageId] - Related package ID
 * @returns {Promise<Object>} The created notification
 */
const createPackageNotification = async (userId, title, message, type = 'success', packageId = null) => {
  return createNotification({
    userId,
    title,
    message,
    type,
    category: 'package',
    priority: 'medium',
    relatedEntityType: 'package',
    relatedEntityId: packageId
  });
};

/**
 * Create accident/incident notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} category - 'accident' or 'incident'
 * @param {String} [entityId] - Related accident/incident ID
 * @returns {Promise<Object>} The created notification
 */
const createAccidentIncidentNotification = async (userId, title, message, category = 'accident', entityId = null) => {
  return createNotification({
    userId,
    title,
    message,
    type: 'warning',
    category,
    priority: 'high',
    relatedEntityType: category,
    relatedEntityId: entityId
  });
};

/**
 * Create promotional notification for users
 * @param {Array|String} userIds - User ID(s) - can be array or single string
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {Date} [expiresAt] - Expiration date
 * @param {String} [actionUrl] - Action URL
 * @returns {Promise<Object|Array>} The created notification(s)
 */
const createPromotionalNotification = async (userIds, title, message, expiresAt = null, actionUrl = null) => {
  const notificationData = {
    title,
    message,
    type: 'promotion',
    category: 'general',
    priority: 'low',
    expiresAt,
    actionUrl
  };

  if (Array.isArray(userIds)) {
    return createBulkNotifications(userIds, notificationData);
  } else {
    return createNotification({
      userId: userIds,
      ...notificationData
    });
  }
};

/**
 * Get unread notification count for a user
 * @param {String} userId - User ID
 * @returns {Promise<Number>} Count of unread notifications
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Clean up expired notifications
 * @returns {Promise<Object>} Delete result
 */
const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  createSystemNotification,
  createPaymentNotification,
  createRentalNotification,
  createPackageNotification,
  createAccidentIncidentNotification,
  createPromotionalNotification,
  getUnreadCount,
  markAllAsRead,
  cleanupExpiredNotifications
};