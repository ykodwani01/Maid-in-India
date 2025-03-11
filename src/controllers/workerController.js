const workService = require('../services/workService');
const Booking = require('../models/Booking');

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



module.exports = {schedule};
