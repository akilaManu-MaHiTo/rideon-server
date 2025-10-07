const UserPackage = require("../models/UserPackage");
const Package = require("../models/Package");
const User = require("../models/User");

/**
 * @desc    Activate or renew a package and update user RC total
 * @route   POST /api/user-package/activate
 * @access  Private (User)
 */
exports.activatePackage = async (req, res) => {
  const userId = req.user.id;
  const { packageId } = req.body;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg)
      return res.status(404).json({ success: false, message: "Package not found" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const now = new Date();
    let activatedAt, expiresAt;
    let message;

    // check if user already has this package
    let existing = await UserPackage.findOne({ userId, packageId });

    if (existing) {
      // if package still active → extend time
      if (existing.expiresAt > now) {
        existing.expiresAt.setDate(existing.expiresAt.getDate() + pkg.timePeriod);
        message = "Package renewed successfully";
      } else {
        // expired → reactivate
        activatedAt = now;
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + pkg.timePeriod);
        existing.activatedAt = activatedAt;
        existing.expiresAt = expiresAt;
        message = "Package reactivated successfully";
      }

      await existing.save();

      //  Add RideOn Coins
      user.rc += pkg.rc;
      await user.save();

      return res.status(200).json({
        success: true,
        message,
        data: {
          package: existing,
          updatedRC: user.rc,
        },
      });
    }

    // no existing record then new activation
    activatedAt = now;
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.timePeriod);

    const newActivation = new UserPackage({
      userId,
      packageId,
      activatedAt,
      expiresAt,
    });

    await newActivation.save();

    // Add RideOn Coins
    user.rc += pkg.rc;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Package activated successfully",
      data: {
        package: newActivation,
        updatedRC: user.rc,
      },
    });
  } catch (err) {
    console.error("activatePackage error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};




// Get user's active packages (auto expiry check)
exports.getActivePackages = async (req, res) => {
  const userId = req.user.id;
  try {
    const now = new Date();
    await UserPackage.deleteMany({ expiresAt: { $lt: now } }); // clean expired

    const active = await UserPackage.find({ userId }).populate("packageId");
    const formatted = active.map(up => ({
      _id: up.packageId._id,
      name: up.packageId.name,
      price: up.packageId.price,
      description: up.packageId.description,
      rc: up.packageId.rc,
      timePeriod: up.packageId.timePeriod,
      icon: up.packageId.icon,
      activatedAt: up.activatedAt,
      expiresAt: up.expiresAt,
      daysRemaining: Math.ceil((up.expiresAt - now) / (1000 * 60 * 60 * 24))
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * @desc    Get current RideOn Coin (RC) total for logged-in user
 * @route   GET /api/user-package/rc
 * @access  Private (User)
 */
exports.getUserRCTotal = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("rc name email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "RC total fetched successfully",
      data: {
        name: user.name,
        email: user.email,
        rc: user.rc,
      },
    });
  } catch (err) {
    console.error("getUserRCTotal error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch RC total",
      error: err.message,
    });
  }
};



// // Deactivate a user's package (optional)
// exports.deactivatePackage = async (req, res) => {
//   const userId = req.user.id;
//   const { packageId } = req.body;

//   try {
//     const up = await UserPackage.findOne({ userId, packageId });
//     if (!up) return res.status(404).json({ message: "Package not found for this user" });

//     up.isActive = false;
//     await up.save();
//     res.status(200).json({ message: "Package deactivated" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

