const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
const registeruser = async (userData) => {
  const { name, contactNumber, password,location,email } = userData;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) throw new Error("user already registered");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user entry
  user = new User({ name, contactNumber, password: hashedPassword , location,email});
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
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "23h" });

  return { token, user: { id: user._id} };
};


module.exports = { registeruser, loginuser };