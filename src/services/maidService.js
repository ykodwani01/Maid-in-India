const Maid = require('../models/Maid');
const User = require ('../models/User')

const getProfile = async (userId) => {
    try {
      const profile = await Maid.findOne({ user: userId }).populate("user"); 
      return profile;
    } catch (error) {
      throw new Error("Error fetching profile: " + error.message);
    }
};

const addProfile = async (userid,data) => {
    try {
        const user = await User.findOne({ _id: userid });
        const newProfile = new Maid({user : user, ...data});
        await newProfile.save();
        console.log(newProfile);
        return newProfile;

      } catch (error) {
        throw new Error("Error fetching profile: " + error.message);
      }
}

module.exports = {getProfile,addProfile}