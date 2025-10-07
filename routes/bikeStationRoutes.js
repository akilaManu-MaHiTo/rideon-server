const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBikeStation,
  getAllBikeStation,
  updateBikeStation,
  deleteBikeStation,
  searchBikeStation,
  getBikeStationById,
} = require("../controllers/bikeStationController");

// CRUD Routes
router.post("/", protect, createBikeStation);
router.get("/", protect, getAllBikeStation);
router.get("/bike-id/:id", protect, getBikeStationById);
router.get("/search", protect, searchBikeStation);
router.put("/:id", protect, updateBikeStation);
router.delete("/:id", protect, deleteBikeStation);
module.exports = router;
