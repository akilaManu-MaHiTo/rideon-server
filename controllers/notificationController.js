const { Expo } = require("expo-server-sdk");
const expo = new Expo();

// Temporary in-memory storage (replace with DB in production)
let userTokens = {}; // { userId: expoPushToken }

// Save user token
exports.saveToken = (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token)
      return res.status(400).json({ error: "Missing userId or token" });

    userTokens[userId] = token;
    console.log(`✅ Token saved for user ${userId}: ${token}`);
    res.json({ success: true, message: "Token saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Send push notification to target user
exports.sendNotification = async (req, res) => {
  try {
    const { targetUserId, title, body, data } = req.body;
    const pushToken = userTokens[targetUserId];

    if (!pushToken)
      return res.status(404).json({ error: "Target user not found or no token" });

    if (!Expo.isExpoPushToken(pushToken))
      return res.status(400).json({ error: "Invalid Expo push token" });

    const messages = [
      {
        to: pushToken,
        sound: "default",
        title,
        body,
        data: data || {},
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    console.log("📤 Notification sent:", tickets);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

// Get all tokens (for debugging)
exports.getAllTokens = (req, res) => {
  res.json(userTokens);
};
