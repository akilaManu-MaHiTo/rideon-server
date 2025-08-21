const Product = require("../models/Product");

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.create({
      name,
      price,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "username email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
