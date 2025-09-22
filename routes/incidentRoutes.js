const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createIncident,
  getAllIncident,
  getUserIncidents
} = require("../controllers/incidentController");

// CRUD Routes
router.post("/", protect, createIncident);
router.get("/", protect, getAllIncident);
router.get("/user-incidents", protect, getUserIncidents);

module.exports = router;
