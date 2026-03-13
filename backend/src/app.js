const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const followRoutes = require("./routes/followRoutes");

const app = express();

/* Middleware */

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

/* Database Connection */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* Routes */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follow", followRoutes);

/* Health Check */

app.get("/health", (req, res) => {
  res.json({ status: "API running" });
});

module.exports = app;