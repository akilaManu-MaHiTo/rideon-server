const express = require("express");
const { notifyPayment } = require("../controllers/checkoutController");
const router = express.Router();


// Server-to-server notification endpoint
router.post('/notify', notifyPayment);

module.exports = router;
