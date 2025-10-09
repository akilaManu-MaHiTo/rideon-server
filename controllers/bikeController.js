const Bike = require("../models/Bike");

//Create Bike by admin
exports.createBike = async (req, res) => {
  try {
    const { bikeModel, fuelType, distance, condition } = req.body;

    const userId = req.user.id;

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
    const fuelTypeLower = fuelType.toLowerCase();

    const bike = await Bike.create({
      bikeId,
      bikeModel,
      fuelType: fuelTypeLower,
      distance,
      condition,
      availability: true,
      assigned: false,
      rentApproved: true,
      rentRejected: false,
      createdBy: userId,
    });
    res.status(201).json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//create bike by user
exports.createBikeByUser = async (req, res) => {
  try {
    const { bikeModel, fuelType, distance, condition } = req.body;

    const userId = req.user.id;

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
    const fuelTypeLower = fuelType.toLowerCase();

    const bike = await Bike.create({
      bikeId,
      bikeModel,
      fuelType: fuelTypeLower,
      distance,
      condition,
      availability: true,
      assigned: false,
      rentApproved: false,
      rentRejected: false,
      createdBy: userId,
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
    const bikes = await Bike.find().populate("createdBy", "-password");

    res.status(200).json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//get available bikes
exports.getAvailableBikes = async (req, res) => {
  try {
    const bikes = await Bike.find({
      availability: true,
      assigned: false,
    });
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
    const {
      bikeModel,
      fuelType,
      distance,
      condition,
      availability,
      assigned,
      rentApproved,
      rentRejected
    } = req.body;

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
      availability,
      assigned,
      rentApproved,
      rentRejected
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

    // Group by fuelType
    const groupedStats = {};

    bikes.forEach((bike) => {
      const type = bike.fuelType.toLowerCase(); // e.g., "pedal" or "electric"

      if (!groupedStats[type]) {
        groupedStats[type] = { total: 0, good: 0, average: 0, bad: 0 };
      }

      groupedStats[type].total++;

      if (bike.condition >= 70) {
        groupedStats[type].good++;
      } else if (bike.condition >= 40) {
        groupedStats[type].average++;
      } else {
        groupedStats[type].bad++;
      }
    });

    // Convert counts to percentages per fuel type
    const stats = {};
    for (const [type, data] of Object.entries(groupedStats)) {
      const { total, good, average, bad } = data;
      stats[type] = {
        good: ((good / total) * 100).toFixed(2) + "%",
        average: ((average / total) * 100).toFixed(2) + "%",
        bad: ((bad / total) * 100).toFixed(2) + "%",
      };
    }

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Search Bikes
exports.searchBikes = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const bikes = await Bike.find().populate("createdBy", "-password");
      res.status(200).json(bikes);
    } else {
      const bikes = await Bike.find({
        $or: [
          { bikeId: { $regex: query, $options: "i" } },
          { bikeModel: { $regex: query, $options: "i" } },
          { fuelType: { $regex: query, $options: "i" } },
        ],
      });
      res.status(200).json(bikes);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get Bikes by user
exports.getBikesByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const bikes = await Bike.find({ createdBy: userId });
    res.status(200).json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
