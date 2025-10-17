const mongoose = require("mongoose");
const UserPackage = require("../models/UserPackage");
const Package = require("../models/Package");
const User = require("../models/User");
const { createPackageNotification } = require("../utils/notificationHelper");

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

      // Create notification for package renewal/reactivation
      try {
        await createPackageNotification(
          userId,
          `Package ${message.includes('renewed') ? 'Renewed' : 'Reactivated'}`,
          `Your ${pkg.packageName || 'package'} has been ${message.includes('renewed') ? 'renewed' : 'reactivated'} successfully. ${pkg.rc} RideOn Coins have been added to your account.`,
          'success',
          packageId
        );
      } catch (notificationError) {
        console.error("Notification creation error:", notificationError);
      }

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

    // Create notification for new package activation
    try {
      await createPackageNotification(
        userId,
        'Package Activated',
        `Your ${pkg.packageName || 'package'} has been activated successfully! ${pkg.rc} RideOn Coins have been added to your account. Enjoy your rides!`,
        'success',
        packageId
      );
    } catch (notificationError) {
      console.error("Notification creation error:", notificationError);
    }

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

  try {
    // robustly get user id from token payload (support id or _id)
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id missing from token payload. Cannot fetch active packages.",
      });
    }

    // ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id in token payload.",
      });
    }

    const now = new Date();


    // Optional cleanup (expired packages) – you can scope to this user if preferred
    await UserPackage.deleteMany({ expiresAt: { $lt: now } });

    //  Proper ObjectId creation using 'new'
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Query only for this user's active packages
    const active = await UserPackage.find({ userId: userObjectId }).populate("packageId");

    const formatted = active.map(up => ({
      _id: up.packageId?._id ?? up._id,
      name: up.packageId?.name ?? "",
      price: up.packageId?.price ?? 0,
      description: up.packageId?.description ?? "",
      rc: up.packageId?.rc ?? 0,
      timePeriod: up.packageId?.timePeriod ?? 0,
      icon: up.packageId?.icon ?? "",
      activatedAt: up.activatedAt,
      expiresAt: up.expiresAt,
      daysRemaining: Math.ceil((up.expiresAt - now) / (1000 * 60 * 60 * 24))
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("getActivePackages error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
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

