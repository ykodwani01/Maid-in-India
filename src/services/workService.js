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
            const userContact = user.contactNumber || "Not available";
            const userLocation = user.location || "Not available";
            const slot = booking.slot;
            data.push({ userName, userContact, userLocation, slot });
        }
        return data;
    } catch (error) {
        throw new Error("Error fetching schedule: " + error.message);
    }
};

module.exports = { getSchedule };