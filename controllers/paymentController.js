const crypto = require('crypto');
require('dotenv').config();

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_SECRET_KEY = process.env.PAYHERE_SECRET_KEY;

// Generate hash for payment verification
function generateHash(paymentData) {
  const data = paymentData.merchant_id + paymentData.order_id + paymentData.amount + paymentData.currency + crypto.createHash('md5').update(PAYHERE_SECRET_KEY).digest('hex').toUpperCase();
  return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
}

// Create Payment - Endpoint Logic
exports.createPayment = (req, res) => {
  const { amount, currency, firstName, lastName, email } = req.body;

  // Generate unique order ID
  const orderId = `order_${Date.now()}`;

  const paymentData = {
    sandbox: true, // true for sandbox mode
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: 'https://yourdomain.com/success',
    cancel_url: 'https://yourdomain.com/cancel',
    notify_url: 'https://yourdomain.com/notify',
    order_id: orderId,
    items: 'RC Package Payment',
    currency,
    amount,
    first_name: firstName,
    last_name: lastName,
    email,
  };

  // Generate the hash
  const hash = generateHash(paymentData);
  paymentData.hash = hash;

  // Send the payment data to the frontend
  res.json({ paymentData });
};

// Payment Notification - Webhook Logic
exports.paymentNotification = (req, res) => {
  const data = req.body;

  // Verify the hash received from PayHere
  const calculatedHash = generateHash(data);
  
  if (calculatedHash === data.hash) {
    console.log('Payment Verified:', data);
    // Process the payment, update order status, etc.
    res.send('OK');
  } else {
    console.error('Hash mismatch - Payment verification failed');
    res.status(400).send('Payment verification failed');
  }
};
