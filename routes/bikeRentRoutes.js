const express = require("express");
const {
  rentBikeCreate,
  getRentedBike,
  tripEnd,
} = require("../controllers/bikeRentController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, rentBikeCreate);
router.get("/", protect, getRentedBike);
router.put("/trip-end", protect, tripEnd);

module.exports = router;
