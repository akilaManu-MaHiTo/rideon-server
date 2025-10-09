const RentBike = require("../models/RentBike");

exports.rentBikeCreate = async (req, res) => {
  try {
    const { bikeId, distance, duration, rcPrice, expiresAt,selectedStationId } = req.body;
    const id = req.user.id;
    if (!bikeId || !distance || !duration || !rcPrice || !expiresAt || !selectedStationId) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const rentBike = new RentBike({
      bikeId,
      distance,
      duration,
      rcPrice,
      userId: id,
      expiresAt,
      selectedStationId
    });

    const savedRentBike = await rentBike.save();
    res.status(201).json(savedRentBike);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating rent bike", error: error.message });
  }
};
