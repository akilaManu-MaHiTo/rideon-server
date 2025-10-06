const BikeStation = require("../models/BikeStation");

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

    const firstLetter = stationLocation.charAt(0).toUpperCase();
    const thirdLetter =
      stationLocation.length >= 3
        ? stationLocation.charAt(2).toUpperCase()
        : "";
    const lastLetter = stationLocation
      .charAt(stationLocation.length - 1)
      .toUpperCase();
    if (bikeCount < addedBikesArray.length) {
      return res.status(400).json({
        message: "Bike count does not match the number of bikes provided",
      });
    }
    const randomNum = Math.floor(Math.random() * 10000);
    const stationId = `${firstLetter}${thirdLetter}${lastLetter}-${randomNum}`;
    const updatedStation = await BikeStation.findByIdAndUpdate(id, {
      stationId,
      stationName,
      stationLocation,
      bikeCount,
      bikes: addedBikesArray,
      latitude,
      longitude,
    });

    if (!updatedStation) {
      return res.status(404).json({ message: "Bike station not found" });
    }

    res.status(201).json({ message: "Update Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBikeStation = async (req, res) => {
  try {
    const { id } = req.params;
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
