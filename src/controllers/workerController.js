const workService = require('../services/workService');
const Booking = require('../models/Booking');
const { get } = require('mongoose');

const schedule = async (req,res) => {
    try {
        const uid = req.user.id;
        const bookings = await workService.getSchedule(uid);
        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error in schedule:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const getAllMaids = async (req,res) => {
    try {
        const maids = await workService.getAllMaids();
        return res.status(200).json(maids);
    }
    catch (error) {
        console.error('Error in getAllMaids:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const makeAdmin = async (req,res) => {
    try {
        const email = req.body.email;
        const result = await workService.makeAdmin(email);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in makeAdmin:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {schedule,getAllMaids,makeAdmin};
