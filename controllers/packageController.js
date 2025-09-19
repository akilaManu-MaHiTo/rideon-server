// controllers/packageController.js
const Package = require('../models/Package');


// Create a new package
exports.createPackage = async (req, res) => {
  const { name, rc, price, recommended, icon, description } = req.body;
  try {
    const newPackage = new Package({ name, rc, price, recommended, icon, description });
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  const { id } = req.params;
  try {
    const package = await Package.findById(id);
    if (!package) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(package);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a package
exports.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { name, rc, price, recommended, icon, description } = req.body;
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { name, rc, price, recommended, icon, description },
      { new: true }
    );
    if (!updatedPackage) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(updatedPackage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.paymentSuccess = async (req, res) => {
  const { packageId } = req.body; 

  try {
    
    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      { isActive: true },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ message: 'Payment successful, package is now active' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};