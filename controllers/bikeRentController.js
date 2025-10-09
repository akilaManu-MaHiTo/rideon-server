const RentBike = require("../models/RentBike");
const User = require("../models/User");
exports.rentBikeCreate = async (req, res) => {
  try {
    const { bikeId, distance, duration, rcPrice, selectedStationId } = req.body;
    const id = req.user.id;

    if (!bikeId || !distance || !duration || !rcPrice || !selectedStationId) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
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
