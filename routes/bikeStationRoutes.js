const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBikeStation,
  getAllBikeStation,
} = require("../controllers/bikeStationController");

// CRUD Routes
router.post("/", protect, createBikeStation);
router.get("/", protect, getAllBikeStation);

module.exports = router;
