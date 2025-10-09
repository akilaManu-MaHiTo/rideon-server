const Incident = require("../models/Incident");
const RentBike = require("../models/RentBike");

exports.createIncident = async (req, res) => {
  try {
    const { incidentType, howSerious, description, date, time, stopRide } = req.body;

    if (stopRide === true) {
      await RentBike.findOneAndUpdate(
        { userId: req.user.id, isRented: true },
        { isRented: false },
        { new: true }
      );
    }
    const incident = await Incident.create({
      incidentType,
      howSerious,
      description,
      date,
      time,
      user: req.user.id  // Add user ID from the auth middleware
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllIncident = async (req, res) => {
  try {
    const incidents = await Incident.find().populate('user', 'name email');
    res.status(200).json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateIncident = async (req, res) => {
  try {
    const { incidentType, howSerious, description, date, time } = req.body;
    const incidentId = req.params.id;

    let incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not Authorized to update this incident" });
    }

    incident = await Incident.findByIdAndUpdate(
      incidentId,
      {
        incidentType,
        howSerious,
        description,
        date,
        time // Keep as string since schema expects string
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(incident);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    res.status(200).json({ message: "Incident Deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};