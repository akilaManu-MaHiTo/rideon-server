// routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController'); 
const protect = require("../middleware/authMiddleware");

// Create a new package (Admin only)
router.post('/', protect, packageController.createPackage);

// Get all packages (Admin and User)
router.get('/', protect, packageController.getAllPackages);

// Get a single package by ID (Admin and User)
router.get('/:id', protect, packageController.getPackageById);

// Update a package (Admin only)
router.put('/:id', protect,packageController.updatePackage);

// Delete a package (Admin only)
router.delete('/:id', protect, packageController.deletePackage);

router.post('/payment-success',protect, packageController.paymentSuccess);

module.exports = router;
