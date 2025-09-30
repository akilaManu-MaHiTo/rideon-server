const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBike,
  getAllBike,
  UpdateBike,
  deleteBike,
  getBikeById,
} = require("../controllers/bikeController");

// CRUD Routes
router.post("/", protect, createBike);
router.get("/", protect, getAllBike);
router.put("/:id", protect, UpdateBike);
router.delete("/:id", protect, deleteBike);
router.get("/:id", protect, getBikeById);


module.exports = router;