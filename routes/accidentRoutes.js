const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createAccident,
  getAllAccident,
} = require("../controllers/accidentController");

// CRUD Routes
router.post("/", protect, createAccident);
router.get("/", protect, getAllAccident);
module.exports = router;
