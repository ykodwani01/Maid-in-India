const express = require("express");
const maidController = require("../controllers/maidController");
const authMiddleware = require('../middlewares/authMiddleware')
const maidRoutes = express.Router();

maidRoutes.get("/profile", authMiddleware,maidController.getProfile);
maidRoutes.put("/profile", authMiddleware,maidController.updateProfile);
maidRoutes.post("/register", maidController.register);
maidRoutes.post("/login", maidController.login);
module.exports = maidRoutes;