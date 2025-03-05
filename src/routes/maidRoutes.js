const express = require("express");
const maidController = require("../controllers/maidController");
const authMiddleware = require('../middlewares/authMiddleware')
const maidRoutes = express.Router();

maidRoutes.get("/profile", authMiddleware,maidController.getProfile);
maidRoutes.put("/profile", authMiddleware,maidController.updateProfile);
maidRoutes.post("/verify-otp", maidController.verifyOtp);
maidRoutes.post("/send-otp", maidController.sendOtp);
maidRoutes.post("/book", authMiddleware,maidController.bookMaid);
// maidRoutes.post("/cancel", authMiddleware,maidController.cancelBooking);
// maidRoutes.get("/search", authMiddleware,maidController.searchMaid);
module.exports = maidRoutes;