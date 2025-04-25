const express = require('express');
const workerController = require('../controllers/workerController');
const {authMiddleware} = require('../middlewares/authMiddleware')
const {allowRoles} = require('../middlewares/authMiddleware');
const feedbackController = require('../controllers/feedbackController');
const workerRoutes = express.Router();

// Route to get all bookings
workerRoutes.get('/schedule',authMiddleware,workerController.schedule );
workerRoutes.get('/get-all-maids',authMiddleware,allowRoles('admin'),workerController.getAllMaids);
workerRoutes.get("/feedback/:id",authMiddleware,allowRoles('admin'),feedbackController.getFeedbackById);
workerRoutes.post("/make-admin",authMiddleware,allowRoles('admin'),workerController.makeAdmin);
module.exports = workerRoutes;