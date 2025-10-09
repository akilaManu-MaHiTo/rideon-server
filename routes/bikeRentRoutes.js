const express = require("express");
const { rentBikeCreate } = require("../controllers/bikeRentController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, rentBikeCreate);

module.exports = router;
