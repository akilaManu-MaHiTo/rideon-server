const express = require('express');
const router = express.Router();
const { register, login, protect } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Example protected route
router.get('/protected', protect, (req, res) => {
  res.json({ message: `Welcome user ${req.user.id}, this is a protected route.` });
});

module.exports = router;
