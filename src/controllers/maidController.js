const maidService = require('../services/maidService')

const getProfile = async (req, res) => {
    try {
      const profile = await maidService.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
      const profile = await maidService.updateProfile(req.user.id, req.body);
      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
};


const sendOtp = async (req, res) => {
  try {
    const contact = req.body.contact;
    await maidService.sendOtp(contact);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const contact = req.body.contact;
    const otp = req.body.otp;
    const result = await maidService.verifyOtp(contact, otp);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const searchMaid = async (req, res) => {
  try {
    const data = req.body;
    const maids = await maidService.searchMaid(data);
    return res.status(200).json(maids);
  } catch (error) {
    console.error('Error in searchMaid:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}


const confirmBooking = async (req, res) => {
  try{
    const bookingId = req.body.bookingId;
    const cost = req.body.cost;
    const location = req.body.userLocation;
    const result = await maidService.bookingConfirm(bookingId,cost,location);
    return res.status(200).json(result);
  } catch(error){
    console.error('Error in confirmBooking:', error);
    return res.status(500).json({ message: error.message });
  }
};

const bookMaid = async (req,res) => {
  try {
    const data = req.body
    let userId = req.user.id;
    const booking = await maidService.createBooking(data,userId);
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error in bookMaid:', error);
    return res.status(500).json({ message: error.message});
  }
};

const cancelBooking = async (req,res) => {
  try {
    const data = req.body;
    let uid = req.user.id;
    const booking = await maidService.cancelBooking(uid,data);
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getBookings = async (req,res) => {
  try {
    const uid = req.user.id;
    const bookings = await maidService.getBookings(uid);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getBookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getBookingsById = async (req,res) => {
  try{
    const uid = req.user.id;
    const bookingId = req.params.id;
    const booking = await maidService.getBookingsById(uid,bookingId);
    return res.status(200).json(booking);
  }
  catch (error){
    return res.status(500).json({ message: 'Server error'});
  }
};
const getAllLocation = async (req,res) => {
  try {
    const locations = await maidService.getAllLocation();
    return res.status(200).json(locations);
  } catch (error) {
    console.error('Error in getAllLocation:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
const getSoftBookings = async (req,res) => {
  try {
    const maidId = req.body.maidId;
    const bookings = await maidService.getSoftBookedSlotsByMaid(maidId);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getSoftBookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
const deleteSoftBooking = async (req,res) => {
  try {
    const bookingId = req.body.bookingId;
    console.log(bookingId);
    const bookings = await maidService.deleteSoftBooking(bookingId);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in deleteSoftBookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {getProfile,updateProfile, sendOtp, verifyOtp, deleteSoftBooking,getSoftBookings,bookMaid,searchMaid,confirmBooking,cancelBooking,getBookings,getBookingsById,getAllLocation};