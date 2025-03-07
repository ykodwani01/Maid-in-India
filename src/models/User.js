const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: false},
  location: { type: String },
  password: { type: String, required: true },
  email: { type: String, required:true, unique:true }
});

module.exports = mongoose.model("User", userSchema);
