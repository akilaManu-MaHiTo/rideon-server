const BikeStation = require("../models/BikeStation");
const Bike = require("../models/Bike");

exports.createBikeStation = async (req, res) => {
  try {
    const {
      stationName,
      stationLocation,
      latitude,
      longitude,
      bikeCount,
      addedBikesArray,
    } = req.body;

    const firstLetter = stationLocation.charAt(0).toUpperCase();
    const thirdLetter =
      stationLocation.length >= 3
        ? stationLocation.charAt(2).toUpperCase()
        : "";
    const lastLetter = stationLocation
      .charAt(stationLocation.length - 1)
      .toUpperCase();

    const randomNum = Math.floor(Math.random() * 10000);
    const stationId = `${firstLetter}${thirdLetter}${lastLetter}-${randomNum}`;

    if (bikeCount < addedBikesArray.length) {
      return res.status(400).json({
        message: "Bike count does not match the number of bikes provided",
      });
    }

    if (Array.isArray(addedBikesArray) && addedBikesArray.length > 0) {
      const alreadyAssignedBikes = await Bike.find({
        _id: { $in: addedBikesArray },
        assigned: true,
      });

      if (alreadyAssignedBikes.length > 0) {
        return res.status(400).json({
          message: "One or more bikes are already assigned to a station",
        });
      }
    }

    if (Array.isArray(addedBikesArray) && addedBikesArray.length > 0) {
      await Bike.updateMany(
        { _id: { $in: addedBikesArray } },
        { $set: { assigned: true } }
      );
    }

    const bikeStation = await BikeStation.create({
      stationId,
      stationName,
      stationLocation,
      bikeCount,
      bikes: addedBikesArray,
      latitude,
      longitude,
    });

    res.status(201).json(bikeStation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBikeStation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stationName,
      stationLocation,
      latitude,
      longitude,
      bikeCount,
      addedBikesArray,
    } = req.body;

    if (bikeCount < addedBikesArray.length) {
      return res.status(400).json({
        message: "Bike count does not match the number of bikes provided",
      });
    }

    const firstLetter = stationLocation.charAt(0).toUpperCase();
    const thirdLetter =
      stationLocation.length >= 3
        ? stationLocation.charAt(2).toUpperCase()
        : "";
    const lastLetter = stationLocation
      .charAt(stationLocation.length - 1)
      .toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000);
    const stationId = `${firstLetter}${thirdLetter}${lastLetter}-${randomNum}`;

    const existingStation = await BikeStation.findById(id);
    if (!existingStation) {
      return res.status(404).json({ message: "Bike station not found" });
    }

    const currentBikes = (existingStation.bikes || []).map((b) => b.toString());
    const requestedBikes = (addedBikesArray || []).map((b) => b.toString());

    const toUnassign = currentBikes.filter(
      (bid) => !requestedBikes.includes(bid)
    );
    if (toUnassign.length > 0) {
      await Bike.updateMany(
        { _id: { $in: toUnassign } },
        { $set: { assigned: false } }
      );
    }

    const toAssign = requestedBikes.filter(
      (bid) => !currentBikes.includes(bid)
    );

    if (toAssign.length > 0) {
      const alreadyAssigned = await Bike.find({
        _id: { $in: toAssign },
        assigned: true,
      });

      if (alreadyAssigned.length > 0) {
        return res.status(400).json({
          message:
            "One or more of the newly added bikes are already assigned to another station",
        });
      }

      await Bike.updateMany(
        { _id: { $in: toAssign } },
        { $set: { assigned: true } }
      );
    }

    const updatedStation = await BikeStation.findByIdAndUpdate(
      id,
      {
        stationId,
        stationName,
        stationLocation,
        bikeCount,
        bikes: addedBikesArray,
        latitude,
        longitude,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Update Success", station: updatedStation });
  } catch (err) {
    console.error("Error updating bike station:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBikeStation = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await BikeStation.findById(id);
    if (!station) {
      return res.status(404).json({ message: "Bike station not found" });
    }
    for (const bikeId of station.bikes) {
      await Bike.findByIdAndUpdate(bikeId, { assigned: false });
    }
    const bikeStations = await BikeStation.findByIdAndDelete(id);
    res.status(200).json({ message: "Bike Station Delete Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBikeStation = async (req, res) => {
  try {
    const bikeStations = await BikeStation.find().populate("bikes");
    res.status(200).json(bikeStations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBikeStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const bikeStation = await BikeStation.findById(id).populate({
      path: "bikes",
      match: { availability: true },
    });

    if (!bikeStation) {
      return res.status(404).json({ message: "Bike station not found" });
    }
    res.status(200).json(bikeStation);
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid station ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchBikeStation = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      const bikeStations = await BikeStation.find().populate("bikes");
      res.status(200).json(bikeStations);
    } else {
      const bikeStations = await BikeStation.find({
        $or: [
          { stationName: { $regex: keyword, $options: "i" } },
          { stationId: { $regex: keyword, $options: "i" } },
          { stationLocation: { $regex: keyword, $options: "i" } },
        ],
      }).populate("bikes");

      res.status(200).json(bikeStations);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
