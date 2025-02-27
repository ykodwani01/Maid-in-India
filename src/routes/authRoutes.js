const express = require("express");
const authController = require("../controllers/authController");

const authRoutes = express.Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/google", authController.googleauth);
authRoutes.get("/google/callback", authController.googleCallback);

module.exports = authRoutes;