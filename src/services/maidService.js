const Maid = require('../models/Maid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require("otp-generator");
const twilio = require("twilio");

const getProfile = async (maidId) => {
  try {
    // console.log(maidId);
    const profile = await Maid.findByPk(maidId);
    return profile;
  } catch (error) {
    throw new Error("Error fetching profile: " + error.message);
  }
};


// const login = async (data) => {
//   const contactNumber = data.contact;
//   const password = data.password;
//   const maid = await Maid.findOne({ where: { contact:contactNumber } });
//   if (!maid) {
//     throw new Error("Invalid Maid");
//   }

//   const isMatch = await bcrypt.compare(password, maid.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   const token = jwt.sign({ id: maid.maidId }, process.env.JWT_SECRET, { expiresIn: "23h" });

//   return { token, maid: { id: maid.id, name: maid.name } };
// };

const updateProfile = async(id,data) => {
  try {
    const maid = await Maid.findByPk(id);
    if (!maid) {
      throw new Error("Maid not found");
    }
    // const {name,gender,location,govtId,imageUrl,timeAvailable,daysAvailable,cleaning,cooking} = data;
    // const profileCreated = true;
    // const updatedData = {name,gender, location, govtId, imageUrl, timeAvailable, daysAvailable, cleaning, cooking, profileCreated};
    let profileCreated=false;
    const updatedData = {...data,profileCreated};
    await maid.update(updatedData);
    if(maid.name!=null && maid.gender!=null && maid.location!=null && maid.govtId!=null && maid.imageUrl!=null && maid.timeAvailable!=null && maid.daysAvailable!=null && maid.cleaning!=null && maid.cooking!=null){
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

const createBooking = async(req,res) => {
  try {
    const {maidId,userId,booking_date,slot} = req.body;
    const booking = await Booking.create({maidId,userId,booking_date,slot,paymentStatus:false});
    return booking;
  } catch (error) {
    throw new Error("Error creating booking: " + error.message);
  }
}
module.exports = {getProfile,updateProfile,verifyOtp,sendOtp,createBooking};