require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors({
    origin: `${process.env.SERVER_ORIGIN}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

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
