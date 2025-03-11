const express = require('express');
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middlewares/authMiddleware')

const workerRoutes = express.Router();

// Route to get all bookings
workerRoutes.get('/schedule',authMiddleware,workerController.schedule );

module.exports = workerRoutes;