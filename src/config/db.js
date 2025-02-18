const mongoose = require('mongoose');
require("dotenv").config(); // Load environment variables

const uri = process.env.MONGODB_URI;
// Function to connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB ;