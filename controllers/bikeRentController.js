const { model } = require("mongoose");
const RentBike = require("../models/RentBike");
const User = require("../models/User");
const Bike = require("../models/Bike");
const MyBikeStation = require("../models/bikeStation");
exports.rentBikeCreate = async (req, res) => {
  try {
    const {
      bikeId,
      distance,
      duration,
      rcPrice,
      selectedStationId,
      latitude,
      longitude,
      userLatitude,
      userLongitude,
      fromLatitude,
      fromLongitude,
      bikeStationId,
    } = req.body;
    const id = req.user.id;

    if (
      !bikeId ||
      !distance ||
      !duration ||
      !rcPrice ||
      !selectedStationId ||
      !latitude ||
      !longitude ||
      !userLatitude ||
      !userLongitude ||
      !fromLatitude ||
      !fromLongitude
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const existingActive = await RentBike.findOne({
      userId: id,
      isRented: true,
    });
    if (existingActive) {
      return res
        .status(400)
        .json({ message: "User already has an active rented bike" });
    }

    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (findUser.rc < rcPrice) {
      return res
        .status(400)
        .json({ message: "Insufficient RideOn Coins (RC)" });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { rc: -rcPrice } },
      { new: true }
    );

    const bikeStation = await MyBikeStation.findByIdAndUpdate(
      bikeStationId,
      {
        $pull: { bikes: bikeId },
      },
      { new: true }
    );

    const rentBike = new RentBike({
      bikeId,
      distance,
      duration,
      rcPrice,
      userId: id,
      selectedStationId,
      latitude,
      longitude,
      userLatitude,
      userLongitude,
      fromLatitude,
      fromLongitude,
    });

    const savedRentBike = await rentBike.save();
    res.status(201).json(savedRentBike);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating rent bike", error: error.message });
  }
};

exports.getRentedBike = async (req, res) => {
  try {
    const userId = req.user.id;
    const rentedBikes = await RentBike.findOne({ userId, isRented: true })

      .populate({
        path: "bikeId",
        populate: {
          path: "createdBy",
          model: "User",
          select: "-password -rc",
        },
      })
      .populate("userId", "-password")
      .populate({
        path: "selectedStationId",
        populate: {
          path: "bikes",
          model: "Bike",
        },
      });

    res.json(rentedBikes);
  } catch (error) {
    console.error("Error fetching rented bikes:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rented bikes",
    });
  }
};

exports.getAllRentedBike = async (req, res) => {
  try {
    const rentedBikes = await RentBike.find({ isRented: true })

      .populate({
        path: "bikeId",
        populate: {
          path: "createdBy",
          model: "User",
          select: "-password -rc",
        },
      })
      .populate("userId", "-password")
      .populate({
        path: "selectedStationId",
        populate: {
          path: "bikes",
          model: "Bike",
        },
      });

    res.json(rentedBikes);
  } catch (error) {
    console.error("Error fetching rented bikes:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rented bikes",
    });
  }
};

exports.tripEnd = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID from request:", userId);
    // Find active rental
    const activeRent = await RentBike.findOne({ userId, isRented: true });
    if (!activeRent) {
      return res
        .status(400)
        .json({ message: "No active rental found for this user" });
    }
    console.log("Active Rent:", activeRent);

    // Find the rented bike
    const rentBike = await Bike.findById(activeRent.bikeId);
    if (!rentBike) {
      return res.status(404).json({ message: "Bike not found" });
    }
    console.log("Rented Bike:", rentBike);

    // Update total distance ridden by this bike
    rentBike.distance += activeRent.distance;

    // Calculate condition loss: 1% per 10km
    const conditionLoss = activeRent.distance / 10;
    rentBike.condition = Math.max(0, rentBike.condition - conditionLoss);

    // Make the bike available again
    rentBike.availability = true;

    // Save updated bike
    await rentBike.save();

    // End the rental
    activeRent.isRented = false;
    await activeRent.save();

    res.status(200).json({
      message: "Trip ended successfully",
      updatedBike: rentBike,
      rentDetails: activeRent,
    });
  } catch (error) {
    console.error("Error ending trip:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to end trip",
      error: error.message, // 👈 Add this for debugging
    });
  }
};
