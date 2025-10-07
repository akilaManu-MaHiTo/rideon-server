require("dotenv").config();
require("./utils/scheduler");

const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const bikeStationRoutes = require("./routes/bikeStationRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const packageRoutes = require('./routes/packageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userPackageRoutes = require("./routes/userPackageRoutes");



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
app.use("/api/package", packageRoutes);       // Admin Package management
app.use("/api/user-package", userPackageRoutes); // User package activations


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
