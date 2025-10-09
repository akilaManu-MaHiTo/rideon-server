const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBike,
  getAllBike,
  UpdateBike,
  deleteBike,
  getBikeById,
  getBikeConditionStats,
  getAvailableBikes,
  searchBikes,
  getBikesByUser,
  createBikeByUser,
} = require("../controllers/bikeController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/", protect, createBike);
router.post(
  "/user-bikes",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (!req.file) {
      req.file = (req.files?.file?.[0]) || (req.files?.image?.[0]);
    }
    next();
  },
  createBikeByUser
);


router.get("/search", protect, searchBikes);
router.get("/user-bikes", protect, getBikesByUser);
router.get("/", protect, getAllBike);
router.get("/stats", protect, getBikeConditionStats);
router.get("/available-bikes", protect, getAvailableBikes); 

// DYNAMIC ROUTES LAST
router.put("/:id", protect, UpdateBike);
router.delete("/:id", protect, deleteBike);
router.get("/:id", protect, getBikeById); 

module.exports = router;