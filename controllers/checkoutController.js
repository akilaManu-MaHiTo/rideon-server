const crypto = require('crypto');
const Payment = require('../models/Checkout');

const verifyMd5Sig = (body, merchant_secret) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
  } = body;

  
  const str = `${merchant_id}${order_id}${merchant_secret}${payhere_amount}${payhere_currency}${status_code}`;
  const hash = crypto.createHash('md5').update(str).digest('hex');

  return hash === body.md5sig;
};

exports.notifyPayment = async (req, res) => {
  try {
    const paymentData = req.body;

    const MERCHANT_SECRET = process.env.PAYHERE_SECRET;

    if (!verifyMd5Sig(paymentData, MERCHANT_SECRET)) {
      console.log('MD5 signature mismatch!');
      return res.status(400).send('Invalid signature');
    }

    const payment = await Payment.findOneAndUpdate(
      { payment_id: paymentData.payment_id },
      paymentData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Payment processed:', payment.payment_id);

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
