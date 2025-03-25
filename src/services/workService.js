const Maid = require("../models/Maid");
const Booking = require("../models/Booking");
const User = require("../models/User");
const getSchedule = async (uid) => {
    try {
        const bookings = await Booking.findAll({ where: { maidId: uid, paymentStatus:true} });
        //user name, user contact, user address, booking time, booking date
        let data = [];
        for (const booking of bookings){
            const user = await User.findOne({ _id: booking.userId });
            const userName = user.name;
            const userContact = booking.userContact || "Not available";
            const userLocation = booking.userLocation || "Not available";
            const slot = booking.slot;
            const service = booking.service;
            const cost = booking.cost;
            data.push({ userName, userContact, userLocation, slot, service, cost });
        }
        return data;
    } catch (error) {
        throw new Error("Error fetching schedule: " + error.message);
    }
};

module.exports = { getSchedule };