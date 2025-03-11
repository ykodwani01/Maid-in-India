const Maid = require("../models/Maid");
const Booking = require("../models/Booking");

const getSchedule = async (uid) => {
    try {
        const bookings = await Booking.findAll({ where: { maidId: uid, paymentStatus:true} });
        return bookings;
    } catch (error) {
        throw new Error("Error fetching schedule: " + error.message);
    }
};

module.exports = { getSchedule };