const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
const registeruser = async (userData) => {
  const { name, contactNumber, password,address,email } = userData;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) throw new Error("user already registered");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user entry
  user = new User({ name, role:'user',contactNumber, password: hashedPassword , address,email});
  await user.save();

  return { id: user._id, name: user.name, contactNumber: user.contactNumber, email : user.email};
};

// Login user
const loginuser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate JWT token
  const token = jwt.sign({ id: user._id , role:"user"}, process.env.JWT_SECRET, { expiresIn: "23h" });

  return { token, user: { id: user._id} };
};
const getProfile = async(uid) => {
  const user = await User.findById(uid);
  if (!user) throw new Error("User not found");
  return { id: user._id, name: user.name, contact: user.contactNumber, address: user.address, profileCreated:user.profileCreated };
}

const updateProfile = async(uid,data) => {
  let { name, contactNumber, address } = data;
  const user = await User.findById(uid);
  if (!user) throw new Error("User not found");
  user.name = name || user.name ;
  user.contactNumber = contactNumber || user.contactNumber;
  user.address = address || user.address ;
  user.photoUrl = data.photoUrl || user.photoUrl;
  user.profileCreated=true;
  await user.save();
  return { name: user.name, contactNumber: user.contactNumber, address: user.address, profileCreated: user.profileCreated };
};

const verifyGoogle = async (data) => {
  try {
    const token = data.token;
    
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userinfo = await response.json();
    const { email, id, name, picture } = userinfo;
    // console.log(name);
    
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role:'user',password: "GoogleAuthHenceNoPasswordSecretKey@123456" ,profileCreated:false});
      await user.save();
    }
    
    // Issue JWT using the user's _id (or id from the database)
    const jwtToken = jwt.sign(
      { id: user._id, name, email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: "23h" }
    );
    return { id: user._id, role:user.role || 'user',name:user.name, token: jwtToken, email, picture, profileCreated:user.profileCreated };
  } catch (error) {
    console.error('Error in verifyGoogleService:', error);
    throw error; // rethrow error to let the route handler catch it
  }
};
module.exports = { registeruser, loginuser,verifyGoogle,updateProfile ,getProfile};