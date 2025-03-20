const express = require("express");
const maidController = require("../controllers/maidController");
const authMiddleware = require('../middlewares/authMiddleware');
const feedbackController = require("../controllers/feedbackController");
const maidRoutes = express.Router();

maidRoutes.get("/profile", authMiddleware,maidController.getProfile);
maidRoutes.put("/profile", authMiddleware,maidController.updateProfile);
maidRoutes.post("/verify-otp", maidController.verifyOtp);
maidRoutes.post("/send-otp", maidController.sendOtp);
maidRoutes.post("/book", authMiddleware,maidController.bookMaid);
maidRoutes.post("/cancel-booking", authMiddleware,maidController.cancelBooking);
maidRoutes.post("/search", authMiddleware,maidController.searchMaid);
maidRoutes.post("/confirm-booking", authMiddleware,maidController.confirmBooking);
maidRoutes.get("/bookings", authMiddleware,maidController.getBookings);
maidRoutes.get("/bookings/:id", authMiddleware,maidController.getBookingsById);
maidRoutes.post("/feedback", authMiddleware,feedbackController.submitFeedback);
maidRoutes.get("/feedback/:id", authMiddleware,feedbackController.getFeedbackById);
module.exports = maidRoutes;