const Accident = require("../models/accident");

exports.createAccident = async (req, res) => {
  try {
    const { title, latitude, longitude } = req.body;

    const accident = await Accident.create({
      title,
      latitude,
      longitude,
      user: req.user.id,
    });

    res.status(201).json(accident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAccident = async (req, res) => {
  try {
    const accidents = await Accident.find();
    res.status(200).json(accidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
