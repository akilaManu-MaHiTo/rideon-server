const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to create payment
router.post('/create-payment', paymentController.createPayment);

// Route to handle PayHere payment notification (webhook)
router.post('/notify', paymentController.paymentNotification);

module.exports = router;
