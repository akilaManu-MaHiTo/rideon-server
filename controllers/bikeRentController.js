const { model } = require("mongoose");
const RentBike = require("../models/RentBike");
const User = require("../models/User");
const Bike = require("../models/Bike");
const MyBikeStation = require("../models/BikeStation");
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

    const bike = await Bike.findByIdAndUpdate(
      bikeId,
      { availability: false },
      { new: true }
    );

    const ADD_RC_TO_BIKE_OWNER = rcPrice * 0.1;
    const rentedBikeOwner = await Bike.findById(bikeId);
    if (rentedBikeOwner && rentedBikeOwner.createdBy) {
      await User.findByIdAndUpdate(
        rentedBikeOwner.createdBy,
        { $inc: { rc: ADD_RC_TO_BIKE_OWNER } },
        { new: true }
      );
    }

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
    const activeRent = await RentBike.findOne({ userId, isRented: true });
    if (!activeRent) {
      return res
        .status(400)
        .json({ message: "No active rental found for this user" });
    }

    const rentBike = await Bike.findById(activeRent.bikeId);
    if (!rentBike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    rentBike.distance += activeRent.distance;
    const conditionLoss = activeRent.distance / 10;
    rentBike.condition = Math.max(0, rentBike.condition - conditionLoss);
    rentBike.availability = true;

    if (activeRent.selectedStationId) {
      const destinationStation = await MyBikeStation.findById(
        activeRent.selectedStationId
      );
      if (destinationStation) {
        if (!destinationStation.bikes.includes(rentBike._id)) {
          destinationStation.bikes.push(rentBike._id);
          destinationStation.bikeCount = destinationStation.bikes.length;
          await destinationStation.save();
        }
      } else {
        console.warn("Destination station not found for rent:", activeRent._id);
      }
    }

    await rentBike.save();

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
      error: error.message,
    });
  }
};
