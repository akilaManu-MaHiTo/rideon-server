const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBike,
  getAllBike,
} = require("../controllers/bikeController");

// CRUD Routes
router.post("/", protect, createBike);
router.get("/", protect, getAllBike);

module.exports = router;