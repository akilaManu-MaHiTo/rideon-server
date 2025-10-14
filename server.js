require("dotenv").config();
require("./utils/scheduler");
require("./utils/rewardCron");

const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const bikeStationRoutes = require("./routes/bikeStationRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const packageRoutes = require('./routes/packageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const IncidentRoutes = require('./routes/incidentRoutes');
const AccidentRoutes = require('./routes/accidentRoutes');
const obstacleRoutes = require('./routes/obstacleRoutes');
const userPackageRoutes = require("./routes/userPackageRoutes");
const rentBikeRoutes = require("./routes/bikeRentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const rewardRoutes = require("./routes/rewardRoutes");



const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: `${process.env.SERVER_ORIGIN}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));
app.use(bodyParser.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bike-station", bikeStationRoutes);
app.use("/api/bike", bikeRoutes);
app.use('/api', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/incident', IncidentRoutes);
app.use('/api/accident', AccidentRoutes);
app.use('/api/obstacle', obstacleRoutes);
app.use("/api/package", packageRoutes);   
app.use("/api/user-package", userPackageRoutes); 
app.use("/api/rent-bike", rentBikeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the backend API!');
});

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
