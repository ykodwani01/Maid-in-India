const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  location: { type: String, enum: ["Mumbai", "Pune", "Ahmedabad", "Banglore"], required: true },
  password: { type: String, required: true },
  email: { type: String }
});

module.exports = mongoose.model("User", userSchema);
