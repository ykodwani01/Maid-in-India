const Maid = require("../models/Maid");
const Booking = require("../models/Booking");
const User = require("../models/User");
const cron = require("node-cron");
const moment = require("moment");

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


const accountSid = process.env.accountSid
const authToken = process.env.authToken
const client = require('twilio')(accountSid, authToken);
const jobMap = new Map();

function createCronExpression(days, slotTime) {
    // Subtract 30 minutes from service time.
    const time = moment(slotTime, "HH:mm").subtract(35, "minutes");
    const minute = time.minute();
    const hour = time.hour();
  
    // Map full day names to cron abbreviations.
    const dayMap = {
      sunday: "SUN",
      monday: "MON",
      tuesday: "TUE",
      wednesday: "WED",
      thursday: "THU",
      friday: "FRI",
      saturday: "SAT",
      sunday: "SUN",
    };
    const cronDays = days.map((day) => dayMap[day.toLowerCase()])
    .filter((val) => val !== undefined)
    .join(",");

    return `${minute} ${hour} * * ${cronDays}`;
}

const scheduleReminderJob = async (booking) => {
    let time="";
    let days = [];
    for (const day in booking.slot) {
        time = booking.slot[day];
        days.push(day);
    }
    // console.log(booking);
    const cronExpression = createCronExpression(days, time);
    //console.log(cronExpression);
    const maid = await Maid.findOne({where:{maidId:booking.maidId}});
    // console.log(maid);
    const contact = maid.contact;
    const maidName = maid.name;
    const userLocation = booking.userLocation;
    //console.log(maidName,contact,userLocation);

    const job = cron.schedule(cronExpression, () => {
    
        
        client.messages.create({
            from: 'whatsapp:+14155238886',
            body: `Hello ${maidName} , Your service starts in 30 min reminder at ${userLocation}`,
            to: `whatsapp:${contact}`
        });
        //console.log("Message sent");

    });
    
    //console.log("Created cron job");
    jobMap.set(booking.Bookingid, job);
}

const cancelReminderJob = async(bookingId) => {
    const job = jobMap.get(bookingId);
    if (job) {
      await job.stop(); 
      await jobMap.delete(bookingId); // Remove it from the job map.
    } else {
      console.log(`No scheduled job found for booking ${bookingId}`);
    }
}


module.exports = { getSchedule,scheduleReminderJob, cancelReminderJob };