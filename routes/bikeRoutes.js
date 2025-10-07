const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBike,
  getAllBike,
  UpdateBike,
  deleteBike,
  getBikeById,
  getBikeConditionStats,
  getAvailableBikes,
  searchBikes,
} = require("../controllers/bikeController");

// CRUD Routes - SPECIFIC ROUTES FIRST
router.post("/", protect, createBike);
router.post("/search", protect, searchBikes);
router.get("/", protect, getAllBike);
router.get("/stats", protect, getBikeConditionStats);
router.get("/available-bikes", protect, getAvailableBikes); 

// DYNAMIC ROUTES LAST
router.put("/:id", protect, UpdateBike);
router.delete("/:id", protect, deleteBike);
router.get("/:id", protect, getBikeById); // This should be LAST

module.exports = router;