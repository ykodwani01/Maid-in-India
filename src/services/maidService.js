const Maid = require('../models/Maid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const otpGenerator = require("otp-generator");
// const twilio = require("twilio");

const getProfile = async (maidId) => {
  try {
    const profile = await Maid.findByPk(maidId);
    return profile;
  } catch (error) {
    throw new Error("Error fetching profile: " + error.message);
  }
};


const register = async (data) => {
  try {
    // Check if a maid with the given contactNumber already exists
    const existingMaid = await Maid.findOne({ where: { contact: data.contact } });
    if (existingMaid) {
      throw new Error("Maid already exists");
    }
    
    if (!data.password) {
      throw new Error("Password is required");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const newMaid = await Maid.create(data);
    // console.log(newMaid);
    return newMaid;
    
  } catch (error) {
    // console.log(error.message);
    throw new Error("Error registering maid: " + error.message);
  }
};

const login = async (data) => {
  const contactNumber = data.contact;
  const password = data.password;
  const maid = await Maid.findOne({ where: { contact:contactNumber } });
  if (!maid) {
    throw new Error("Invalid Maid");
  }

  const isMatch = await bcrypt.compare(password, maid.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: maid.maidId }, process.env.JWT_SECRET, { expiresIn: "23h" });

  return { token, maid: { id: maid.id, name: maid.name } };
};
const updateProfile = async(id,data) => {
  try {
    const maid = await Maid.findByPk(id);
    if (!maid) {
      throw new Error("Maid not found");
    }
    await maid.update(data);
    return maid;
  } catch (error) {
    throw new Error("Error updating profile: " + error.message);
  }
};


// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// const otpStore = new Map();

// const sendOtp = async (contact) => {
//   const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
//   const expiry = Date.now() + OTP_EXPIRY;
//   otpStore.set(contact, { otp, expiry });

//   await client.messages.create({
//     body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to: contact,
//   });

//   return { message: "OTP sent successfully" };
// };

// const verifyOtp = async (contact, enteredOtp) => {
//   const storedOtpData = otpStore.get(contact);
//   if (!storedOtpData) throw new Error("OTP not found or expired");

//   const { otp, expiry } = storedOtpData;
//   if (Date.now() > expiry) throw new Error("OTP expired");
//   if (enteredOtp !== otp) throw new Error("Invalid OTP");

//   let maid = await Maid.findOne({ where: { contact } });
//   if (!maid) {
//     maid = await Maid.create({ contact, password: "GoogleAuthNoPass" });
//   }

//   const token = jwt.sign({ id: maid.id }, process.env.JWT_SECRET, { expiresIn: "23h" });

//   otpStore.delete(contact);
//   return { token, maid: { id: maid.id, contact } };
// };


module.exports = {getProfile,register,login,updateProfile};