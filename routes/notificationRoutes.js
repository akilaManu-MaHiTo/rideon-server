const express = require("express");
const router = express.Router();
const {
  saveToken,
  sendNotification,
  getAllTokens,
} = require("../controllers/notificationController");

// Save expo token
router.post("/save-token", saveToken);

// Send notification to specific user
router.post("/send", sendNotification);

// (Optional) View all saved tokens
router.get("/tokens", getAllTokens);

module.exports = router;
