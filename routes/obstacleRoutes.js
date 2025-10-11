const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createObstacle,
  updateObstacle,
  updateObstacleIsShow,
  getObstacles,
  getObstacleById,
  deleteObstacle,
} = require("../controllers/obstacleController");


router.post("/", protect, createObstacle);
router.put("/:id", protect, updateObstacle);
router.patch("/:id/is-show", protect, updateObstacleIsShow);
router.get("/", protect, getObstacles);
router.get("/:id", protect, getObstacleById);
router.delete("/:id", protect, deleteObstacle);

module.exports = router;
