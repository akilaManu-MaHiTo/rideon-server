const { model } = require("mongoose");
const RentBike = require("../models/RentBike");
const User = require("../models/User");
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
      !userLongitude
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
