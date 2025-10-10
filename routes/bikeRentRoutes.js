const express = require("express");
const {
  rentBikeCreate,
  getRentedBike,
  getAllRentedBike,
} = require("../controllers/bikeRentController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, rentBikeCreate);
router.get("/", protect, getRentedBike);
router.get("/all-rented", protect, getAllRentedBike);
module.exports = router;
