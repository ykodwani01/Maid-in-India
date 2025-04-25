const express = require("express");
const authController = require("../controllers/authController");
const {authMiddleware} = require('../middlewares/authMiddleware');

const authRoutes = express.Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/update", authMiddleware,authController.updateProfile);
authRoutes.post("/profile", authMiddleware,authController.getProfile);
authRoutes.get("/google", authController.googleauth);
authRoutes.get("/google/callback", authController.googleCallback);
authRoutes.post("/verify-google",authController.verifyGoogle);
module.exports = authRoutes;