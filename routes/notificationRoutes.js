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

// Bulk delete notifications
router.delete('/bulk-delete', protect, notificationController.bulkDeleteNotifications);

// Get notification by ID
router.get('/:id', protect, notificationController.getNotificationById);

// Update notification (Admin only)
router.put('/:id', protect, notificationController.updateNotification);

// Delete notification
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
