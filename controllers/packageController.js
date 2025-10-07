const Package = require("../models/Package");
const UserPackage = require("../models/UserPackage");
const cloudinary = require("../utils/cloudinary");

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const { name, rc, price, recommended, description, timePeriod } = req.body;
    let imageUrl = "";

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, { folder: "packages" });
      imageUrl = upload.secure_url;
    }

    const newPackage = new Package({
      name,
      rc,
      price,
      recommended,
      description,
      icon: imageUrl,
      timePeriod
    });

    await newPackage.save();
    res.status(201).json({ message: "Package created successfully", data: newPackage });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get all packages with activation statistics
 * @route   GET /api/package
 */
exports.getAllPackages = async (req, res) => {
  try {
    // Fetch all packages
    const packages = await Package.find().sort({ createdAt: -1 });

    // Calculate activation counts efficiently
    const packagesWithStats = await Promise.all(
      packages.map(async (pkg) => {
        const activationCount = await UserPackage.countDocuments({
          packageId: pkg._id,
          expiresAt: { $gt: new Date() } // count only active ones
        });

        return {
          _id: pkg._id,
          name: pkg.name,
          rc: pkg.rc,
          price: pkg.price,
          description: pkg.description,
          recommended: pkg.recommended,
          icon: pkg.icon,
          timePeriod: pkg.timePeriod,
          createdAt: pkg.createdAt,
          activationCount,
        };
      })
    );

    // Uniform structured response
    res.status(200).json({
      success: true,
      totalPackages: packagesWithStats.length,
      data: packagesWithStats,
    });
  } catch (error) {
    console.error(" [getAllPackages] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve packages",
      error: error.message,
    });
  }
};

// Get single package
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.status(200).json(pkg);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rc, price, recommended, description, timePeriod } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, { folder: "packages" });
      pkg.icon = upload.secure_url;
    }

    Object.assign(pkg, { name, rc, price, recommended, description, timePeriod });
    await pkg.save();

    res.status(200).json({ message: "Package updated", data: pkg });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Package not found" });
    res.status(200).json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
