const Maid = require('../models/Maid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const Booking = require('../models/Booking');
const { Op } = require('sequelize');
const workService = require('../services/workService');

const getProfile = async (maidId) => {
  try {
    // console.log(maidId);
    const profile = await Maid.findByPk(maidId);
    return profile;
  } catch (error) {
    throw new Error("Error fetching profile: " + error.message);
  }
};


const updateProfile = async(id,data) => {
    try {
    const maid = await Maid.findByPk(id);
    if (!maid) {
      throw new Error("Maid not found");
    }
    
    // Update the maid with new data first
    await maid.update(data);
    
    // Check if all fields are filled
    const profileCompleted = maid.name && maid.gender && maid.location &&
      maid.govtId && maid.imageUrl && maid.timeAvailable &&
      maid.cleaning !== null && maid.cooking !== null;

    if (profileCompleted) {
      await maid.update({ profileCreated: true });
    }

    return maid;
  } catch (error) {
    throw new Error("Error updating profile: " + error.message);
  }
};


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

const otpStore = new Map();

const axios = require("axios");

const sendOtp = async (contact) => {

  
  const response = await axios.post(
    `https://verify.twilio.com/v2/Services/${process.env.VERIFY_SERVICE_SID}/Verifications`,
    new URLSearchParams({
      To: contact,
      Channel: "sms",
    }).toString(),
    {
      auth: {
        username: process.env.TWILIO_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return {"message" : "OTP sent successfully"};
};


const verifyOtp = async (contact, code) => {
  const response = await axios.post(
    `https://verify.twilio.com/v2/Services/${process.env.VERIFY_SERVICE_SID}/VerificationCheck`,
    new URLSearchParams({
      To: contact,
      Code: code,
    }).toString(),
    {
      auth: {
        username: process.env.TWILIO_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  if (response.data.status === "approved") {
    let maid = await Maid.findOne({ where: { contact } });
    if (!maid) {
      maid = await Maid.create({ contact, profileCreated: false });
    }
    const token = jwt.sign({ id: maid.maidId }, process.env.JWT_SECRET, { expiresIn: "23h" });
    return { token, maid: { id: maid.maidId, contact } };
  } else {
    throw new Error("OTP verification failed");
  }
};


const searchMaid = async (data) => {
  try {
    const { location,type } = data;
    
    const service = data.service;

    let whereClause = { location: location };
    if (service === "cleaning") {
      whereClause.cleaning = "true";
    } else if (service === "cooking") {
      whereClause.cooking = "true";
    }
    else if(service === "both"){
      whereClause.cleaning = "true";
      whereClause.cooking = "true";
    }
    else {
      //if service is null search only by location
    }

    const maids = await Maid.findAll({
      where: whereClause
    });

    
    const filteredMaids = [];

    if(type==1){
      const day = "Monday";
      for (const maid of maids) {
        const availability = maid.timeAvailable || {};
        if (availability[day]) {
          filteredMaids.push(maid);
        }
      }
    }
    else if(type==2){
      const day = "Tuesday";
      for (const maid of maids) {
        const availability = maid.timeAvailable || {};
        if (availability[day]) {
          filteredMaids.push(maid);
        }
      }
    }
    else{
      for (const maid of maids) {
        const availability = maid.timeAvailable || {};
        if ((availability["Monday"]) || (availability["Tuesday"])) {
          filteredMaids.push(maid);
        }
      }
    }
    return filteredMaids;
  }
  catch (error) {
    throw new Error("Error searching maids: " + error.message);
  }
};

const createBooking = async(data,userId) => {
  try {
    const {maidId,slot,type,service} = data;
    const maid = await Maid.findByPk(maidId);
    
    let time = {};
    if(type==1){
      time = {"Monday":slot, "Wednesday" : slot, "Friday" : slot};
    }
    else if(type==2){
      time = {"Tuesday":slot, "Thursday" : slot, "Saturday" : slot};
    }
    else{
      time = {"Monday":slot, "Tuesday":slot, "Wednesday" : slot, "Thursday" : slot, "Friday" : slot, "Saturday" : slot, "Sunday" :slot};
    }


    const booking = await Booking.create({maidId,userId,slot:time,paymentStatus:false,service});
    return booking;
  } catch (error) {
    throw new Error("Error creating booking: " + error.message);
  }
};

const bookingConfirm = async (bookingId,cost,location,contact) => {
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    await booking.update({paymentStatus:true,cost:cost,userLocation:location,userContact:contact});
    const maidId = booking.maidId;
    const maid = await Maid.findByPk(maidId); 
    // const uid = booking.userId;
    // const user = await User.findOne({ _id: uid });
    // user.location = location;
    // await user.save();
    for (const day in booking.slot) {
      const time = booking.slot[day];
      maid.timeAvailable[day] = maid.timeAvailable[day].filter(slot => slot !== time);
    }
    maid.changed('timeAvailable', true);

    // Save the changes to the database
    await maid.save();
    workService.scheduleReminderJob(booking);
    return booking;
  } catch (error) {
    throw new Error("Error confirming booking: " + error.message);
  }
};

//cancel booking by user only
const cancelBooking = async(uid,data) => {
    try{
      const bookingId = data.bookingId;
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }
      if(booking.userId!=uid){
        throw new Error("Unauthorized");
      }
      const maidId = booking.maidId;
      const maid = await Maid.findByPk(maidId);
      for (const day in booking.slot) {
        const time = booking.slot[day];
        maid.timeAvailable[day].push(time);
        maid.changed('timeAvailable', true);
      }

    // Save the changes to the database
      await maid.save();
      await booking.destroy();
      await workService.cancelReminderJob(bookingId);
    }
    catch(error){
      throw new Error("Error cancelling booking: " + error.message);
    }
};

const getBookings = async(uid) => {
  try{
    const bookings = await Booking.findAll({
      where: {
          userId: uid,
          paymentStatus: true
      }
    });

    const bookingsWithMaid = await Promise.all(bookings.map(async (booking) => {
      const maid = await Maid.findOne({ where: { maidId: booking.maidId } });
      return { ...booking.toJSON(), maidName: maid ? maid.name : null , maidContact: maid ? maid.contact : null};
    }));

    return bookingsWithMaid;
  }
  catch(error){
    throw new Error("Error fetching bookings: " + error.message);
  }
};

const getBookingsById = async(uid,bookingId) => {
  try{
    const booking = await Booking.findByPk(bookingId);
    if(booking.userId!=uid){
      throw new Error("Unauthorized");
    }
    return booking;
  }
  catch(error){
    throw new Error("Error fetching booking: " + error.message);
  }
};

const getAllLocation = async() => {
  try{
    const maids = await Maid.findAll();
    const location = new Set();
    for(const maid of maids){
      location.add(maid.location);
    }
    const array = Array.from(location);
    return array;
    // return location.values();
  }
  catch(error){
    throw new Error("Error fetching locations: " + error.message);
  }
};

module.exports = {getProfile,updateProfile,verifyOtp,sendOtp,createBooking,searchMaid,bookingConfirm,cancelBooking,getBookings,getBookingsById,getAllLocation};