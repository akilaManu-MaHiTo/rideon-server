const Bike = require("../models/Bike");

exports.createBike = async (req, res) => {
  try {
    const { bikeModel, fuelType, distance, condition } = req.body;
    
    let prefix = "";
    if (fuelType.toLowerCase() === "electric") {
      prefix = "EV";
    } else if (fuelType.toLowerCase() === "pedal") {
      prefix = "PD";
    } else {
      prefix = "BK";
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bikeId = `${prefix}${randomNum}`;

    const bike = await Bike.create({
      bikeId,
      bikeModel,
      fuelType,
      distance,
      condition,
    });
    res.status(201).json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBike = async (req, res) => {
    try {
        const bike = await bike.find();
        res.status(200).json(bike);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
