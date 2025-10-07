const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const userPackageController = require("../controllers/userPackageController");

router.post("/activate", protect, userPackageController.activatePackage);
router.get("/active", protect, userPackageController.getActivePackages);
// Get RC total for the user
router.get("/rc", protect, userPackageController.getUserRCTotal);

// router.post("/deactivate", protect, userPackageController.deactivatePackage);

module.exports = router;
