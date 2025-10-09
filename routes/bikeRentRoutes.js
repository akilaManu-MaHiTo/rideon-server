const express = require("express");
const {
  rentBikeCreate,
  getRentedBike,
} = require("../controllers/bikeRentController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, rentBikeCreate);
router.get("/", protect, getRentedBike);

module.exports = router;
