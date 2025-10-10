const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const protect = require("../middleware/authMiddleware");

// Create a new notification (Admin only)
router.post('/', protect, notificationController.createNotification);

// Get all notifications (Admin only)
router.get('/', protect, notificationController.getAllNotifications);

// Get current user's notifications
router.get('/my-notifications', protect, notificationController.getMyNotifications);

// Get notification statistics
router.get('/stats', protect, notificationController.getNotificationStats);

// Mark all notifications as read for current user
router.patch('/mark-all-read', protect, notificationController.markAllAsRead);

// Bulk delete notifications
router.delete('/bulk-delete', protect, notificationController.bulkDeleteNotifications);

// Get notification by ID
router.get('/:id', protect, notificationController.getNotificationById);

// Update notification
router.put('/:id', protect, notificationController.updateNotification);

// Mark notification as read
router.patch('/:id/read', protect, notificationController.markAsRead);

// Delete notification
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;