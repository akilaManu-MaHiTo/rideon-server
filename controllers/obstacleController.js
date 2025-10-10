const Obstacle = require("../models/Obstacle");

exports.createObstacle = async (req, res) => {
  try {
    const { name, category, isShow, obstacleLatitude, obstacleLongitude } =
      req.body;

    if (!name || category === undefined) {
      return res
        .status(400)
        .json({ message: "name and category are required" });
    }

    const obstacle = await Obstacle.create({
      name,
      category,
      obstacleLatitude,
      obstacleLongitude,
      userId: req.user.id,
    });

    res.status(201).json(obstacle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateObstacle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, isShow } = req.body;

    const obstacle = await Obstacle.findById(id);
    if (!obstacle)
      return res.status(404).json({ message: "Obstacle not found" });
    if (obstacle.userId.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this obstacle" });
    }

    const updated = await Obstacle.findByIdAndUpdate(
      id,
      { name, category, isShow },
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateObstacleIsShow = async (req, res) => {
  try {
    const { id } = req.params;
    const obstacle = await Obstacle.findByIdAndUpdate(
      { id },
      { isShow: false },
      { new: true }
    );
    await obstacle.save();
    res.status(200).json(obstacle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getObstacles = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      const obstacles = await Obstacle.find({ isShow: true })
        .populate("userId", "-password")
        .sort({ createdAt: -1 });
      res.status(200).json(obstacles);
    } else {
      const obstacles = await Obstacle.find({ isShow: true, category })
        .populate("userId", "-password")
        .sort({ createdAt: -1 });

      res.status(200).json(obstacles);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getObstacleById = async (req, res) => {
  try {
    const { id } = req.params;
    const obstacle = await Obstacle.findById(id).populate(
      "userId",
      "name email"
    );
    if (!obstacle)
      return res.status(404).json({ message: "Obstacle not found" });

    res.status(200).json(obstacle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteObstacle = async (req, res) => {
  try {
    const { id } = req.params;
    const obstacle = await Obstacle.findById(id);
    if (!obstacle)
      return res.status(404).json({ message: "Obstacle not found" });
    if (obstacle.userId.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this obstacle" });
    }

    await Obstacle.findByIdAndDelete(id);
    res.status(200).json({ message: "Obstacle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
