const express = require("express");
const maidController = require("../controllers/maidController");
const authMiddleware = require('../middlewares/authMiddleware')
const maidRoutes = express.Router();

maidRoutes.get("/profile", authMiddleware,maidController.getProfile);
maidRoutes.put("/profile", authMiddleware,maidController.updateProfile);
maidRoutes.post("/verify-otp", maidController.verifyOtp);
maidRoutes.post("/send-otp", maidController.sendOtp);
module.exports = maidRoutes;