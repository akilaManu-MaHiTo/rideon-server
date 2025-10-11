const express = require("express");
const {
  rentBikeCreate,
  getRentedBike,
    tripEnd,
  getAllRentedBike,
  updateUserLocation,
  getAllRentedBikeHistory,
} = require("../controllers/bikeRentController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, rentBikeCreate);
router.get("/", protect, getRentedBike);
router.put("/trip-end", protect, tripEnd);
router.get("/all-rented", protect, getAllRentedBike);
router.put("/me", protect, updateUserLocation);
router.get("/rented-bike-history", protect, getAllRentedBikeHistory);
module.exports = router;
