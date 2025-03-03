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
}

module.exports = {getProfile,updateProfile, sendOtp, verifyOtp};