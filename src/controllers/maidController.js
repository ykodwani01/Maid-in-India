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

const addProfile = async (req,res) => {
    try{
        const newProfile = await maidService.addProfile(req.user.id,req.body);
        return res.status(201).json(newProfile);

    } catch (error) {
        
        return res.status(500).json({message : "Cant add to profile"});
    }
};



module.exports = {getProfile,addProfile}