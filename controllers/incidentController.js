const Incident = require("../models/Incident");

exports.createIncident = async (req, res) => {
  try {
    const { incidentType,howSerious,description,date,time } = req.body;

    const incident = await Incident.create({
      incidentType,
      howSerious,
      description,
      date,
      time,
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllIncident = async (req, res) => {
  try {
    const incident = await Incident.find();
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
