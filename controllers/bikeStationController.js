const BikeStation = require("../models/BikeStation");

exports.createBikeStation = async (req, res) => {
  try {
    const { stationName, stationLocation, latitude, longitude } = req.body;

    const firstLetter = stationLocation.charAt(0).toUpperCase();
    const lastLetter = stationLocation
      .charAt(stationLocation.length - 1)
      .toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000);
    const stationId = `${firstLetter}${lastLetter}-${randomNum}`;

    const bikeStation = await BikeStation.create({
      stationId,
      stationName,
      stationLocation,
      latitude,
      longitude,
    });

    res.status(201).json(bikeStation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBikeStation = async (req, res) => {
  try {
    const bikeStations = await BikeStation.find();
    res.status(200).json(bikeStations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
