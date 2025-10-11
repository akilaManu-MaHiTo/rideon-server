const Accident = require("../models/accident");
const RentBike = require("../models/RentBike");

exports.createAccident = async (req, res) => {
  try {
    const { title, latitude, longitude } = req.body;
    await RentBike.findOneAndUpdate(
      { userId: req.user.id, isRented: true },
      { isRented: false },
      { new: true }
    );
    const accident = await Accident.create({
      title : "Emergency",
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
    const accidents = await Accident.find()
    .populate('user', 'name mobile')
    .sort({ createdAt: -1 });
    res.status(200).json(accidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
