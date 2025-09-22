const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createIncident,
  getAllIncident,
} = require("../controllers/incidentController");

// CRUD Routes
router.post("/", protect, createIncident);
router.get("/", protect, getAllIncident);

module.exports = router;
