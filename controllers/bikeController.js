const Bike = require("../models/Bike");

//Create Bike
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

//Get All Bikes
exports.getAllBike = async (req, res) => {
  try {
    const bikes = await Bike.find(); 
    res.status(200).json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Update Bike
exports.UpdateBike = async (req, res) => {
  try {
    const { id } = req.params;
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

    const updatedBike = await Bike.findByIdAndUpdate(id, {
      bikeId,
      bikeModel,
      fuelType,
      distance,
      condition,
    });

    if (!updatedBike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    res.status(200).json({ message: "Bike updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Delete Bike
exports.deleteBike = async (req, res) => {
  try {
    const { id } = req.params;
    const bike = await Bike.findByIdAndDelete(id);
    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get Bike By Id
exports.getBikeById = async (req, res) => {
  try {
    const { id } = req.params;
    const bike = await Bike.findById(id);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }
    res.status(200).json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get Bike Condition Statistics
exports.getBikeConditionStats = async (req, res) => {
  try {
    const bikes = await Bike.find();

    if (!bikes.length) {
      return res.status(200).json({ message: "No bikes found", stats: {} });
    }

    const total = bikes.length;

    // Define thresholds
    let good = 0,
      average = 0,
      bad = 0;

    bikes.forEach((bike) => {
      if (bike.condition >= 70) {
        good++;
      } else if (bike.condition >= 40) {
        average++;
      } else {
        bad++;
      }
    });

    // Convert to percentages
    const stats = {
      good: ((good / total) * 100).toFixed(2) + "%",
      average: ((average / total) * 100).toFixed(2) + "%",
      bad: ((bad / total) * 100).toFixed(2) + "%",
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
