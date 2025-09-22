const Incident = require("../models/Incident");

exports.createIncident = async (req, res) => {
  try {
    const { incidentType, howSerious, description, date, time } = req.body;
    
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
