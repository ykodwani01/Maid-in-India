const express = require("express");
const maidController = require("../controllers/maidController");
const authMiddleware = require('../middlewares/authMiddleware')
const maidRoutes = express.Router();

maidRoutes.get("/profile", authMiddleware,maidController.getProfile);
maidRoutes.post("/profile", authMiddleware,maidController.addProfile);

module.exports = maidRoutes;