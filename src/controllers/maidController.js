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



const register = async (req,res) => {
  try{
      const newMaid = await maidService.register(req.body);
      return res.status(201).json(newMaid);

  } catch (error) {
      
      return res.status(500).json({message : "Cant add to profile"});
  }
};

const login = async (req,res) => {
  try{
      const maid = await maidService.login(req.body);
      return res.status(201).json(maid);

  } catch (error) {
      console.log(error.message);
      return res.status(500).json({message : "Cant login"});
  }
};



module.exports = {getProfile,register,login,updateProfile};