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
} = require("../controllers/bikeController");

// CRUD Routes
router.post("/", protect, createBike);
router.get("/", protect, getAllBike);
router.get("/stats", protect, getBikeConditionStats);
router.put("/:id", protect, UpdateBike);
router.delete("/:id", protect, deleteBike);
router.get("/:id", protect, getBikeById);


module.exports = router;