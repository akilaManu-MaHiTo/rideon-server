const express = require("express");
const { rentBikeCreate } = require("../controllers/bikeRentController");
const router = express.Router();

router.post("/", protect, rentBikeCreate);

module.exports = router;
