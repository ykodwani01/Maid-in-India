const Maid = require('../models/Maid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

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
    let profileCreated=false;
    const updatedData = {...data,profileCreated};
    await maid.update(updatedData);
    if(maid.name!=null && maid.gender!=null && maid.location!=null && maid.govtId!=null && maid.imageUrl!=null && maid.timeAvailable!=null && maid.cleaning!=null && maid.cooking!=null){
      profileCreated = true;
    }
    maid.update({profileCreated:profileCreated});
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
    const { location, slot } = data;
    const day = Object.keys(slot)[0];
    const time = slot[day];
    const service = data.service;

    let whereClause = { location: location };
    if (service === "cleaning") {
      whereClause.cleaning = "true";
    } else if (service === "cooking") {
      whereClause.cooking = "true";
    }
    else {
      whereClause.cooking = "false";
      whereClause.cleaning = "false";
    }

    const maids = await Maid.findAll({
      where: whereClause
    });


    const filteredMaids = [];
    for (const maid of maids) {
      const availability = maid.timeAvailable || {};
      if (availability[day] && availability[day].includes(time)) {
        filteredMaids.push(maid);
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
    const {maidId,slot} = data;
    const maid = await Maid.findByPk(maidId);
    const day = Object.keys(slot)[0]; // "Tuesday"
    const time = slot[day]; // "9:00"
    const availableMaids = maid.timeAvailable[day].includes(time);
    if (!availableMaids) {
      throw new Error("Maid is not available at this time");
    }

    const booking = await Booking.create({maidId,userId,slot,paymentStatus:false});
    return booking;
  } catch (error) {
    throw new Error("Error creating booking: " + error.message);
  }
};

const bookingConfirm = async (bookingId) => {
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    await booking.update({paymentStatus:true});
    const maidId = booking.maidId;
    const maid = await Maid.findByPk(maidId);
    const day = Object.keys(booking.slot)[0];
    const time = booking.slot[day];
    
    maid.timeAvailable[day] = maid.timeAvailable[day].filter(slot => slot !== time);
    maid.changed('timeAvailable', true);

    // Save the changes to the database
    await maid.save();
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
      const day = Object.keys(booking.slot)[0];
      const time = booking.slot[day];
      maid.timeAvailable[day].push(time);
      maid.changed('timeAvailable', true);

    // Save the changes to the database
      await maid.save();
      await booking.destroy();
    }
    catch(error){
      throw new Error("Error cancelling booking: " + error.message);
    }
};

const getBookings = async(uid) => {
  try{
    const bookings = await Booking.findAll({where:{userId:uid}});
    return bookings;
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
}

//google oauth user backend api

module.exports = {getProfile,updateProfile,verifyOtp,sendOtp,createBooking,searchMaid,bookingConfirm,cancelBooking,getBookings,getBookingsById};