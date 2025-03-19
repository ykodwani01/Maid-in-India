const authService = require("../services/authService");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// Register a new user
const register = async (req, res) => {
  try {
    const user = await authService.registeruser(req.body);
    res.status(201).json({ success: true, user, message: "user registered successfully" });
  } catch (error) {
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

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL;

//Google Oauth
const googleauth = async (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid email profile`;
    res.redirect(authUrl);
};
  
// Google Callback Route
const googleCallback =  async (req, res) => {
try {
    const { code } = req.query;
    // Step 1: Exchange code for Google Access Token
    const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
        grant_type: "authorization_code",
    }
    );
    const { access_token, id_token } = tokenResponse.data;

    // Step 2: Verify the Google ID Token
    const googleUser = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    const { sub, name, email, picture } = googleUser.data;

    const user = await User.findOne({ email });
    let uid = user?.id || 0;

    if (!user) { 
        const newUser = new User({ 
            name, 
            email, 
            location: "Ahmedabad", 
            password: "GoogleAuthHenceNoPasswordSecretKey@123456"
        });

        await newUser.save();
        uid = newUser.id;
    }
    // Step 3: Generate JWT Token for the user
    const token = jwt.sign({ id: uid, name, email },process.env.JWT_SECRET,{ expiresIn: "23h" } );

    // Step 4: Send JWT token to the client
    // res.redirect("http://localhost:5173");
    // res.redirect(`newapp://customer-home?token=${token}`);
  res.json({"token":token});
} catch (error) {
    console.error("Error in Google Auth:", error.response?.data || error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const verifyGoogle = async (req,res) => {
  try{
    const data = req.body;
    // console.log(data);
    const user = await authService.verifyGoogle(data);
    res.status(200).json({success: true, user});
  } catch(error){
    res.status(400).json({success: false, message: error.message});
  }
};
module.exports = { register, login, googleauth, googleCallback , verifyGoogle};
