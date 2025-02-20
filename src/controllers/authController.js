const authService = require("../services/authService");

// Register a new user
const register = async (req, res) => {
  try {
    const user = await authService.registeruser(req.body);
    res.status(201).json({ success: true, user, message: "user registered successfully" });
  } catch (error) {
    console.log("Received User Data:", req.body);
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const data = await authService.loginuser(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};


module.exports = { register, login };
