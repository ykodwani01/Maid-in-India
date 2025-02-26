const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  location: { type: String, enum: ["Mumbai", "Pune", "Ahmedabad", "Banglore"], required: true },
  password: { type: String, required: true },
  email: { type: String, required:true, unique:true }
});

module.exports = mongoose.model("User", userSchema);
