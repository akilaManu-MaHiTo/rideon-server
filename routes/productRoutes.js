const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// CRUD Routes
router.post("/", protect, createProduct);      // Create
router.get("/", protect, getProducts);         // Read all
router.get("/:id", protect, getProductById);   // Read one
router.put("/:id", protect, updateProduct);    // Update
router.delete("/:id", protect, deleteProduct); // Delete

module.exports = router;
