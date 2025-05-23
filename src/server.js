const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const {sequelize,connectDB_pg} = require("./config/db_pg");
const authRoutes = require("./routes/authRoutes");
const maidRoutes = require("./routes/maidRoutes");
const workerRoutes = require("./routes/workerRoutes");

dotenv.config();
connectDB();
connectDB_pg();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/maid", maidRoutes);
app.use("/api/worker",workerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));