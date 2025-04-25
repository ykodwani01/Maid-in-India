const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: false},
  address: { type: String },
  profileCreated : {type: Boolean, default:false},
  password: { type: String, required: true },
  photoUrl : {type: String},
  email: { type: String, required:true, unique:true },
  role : {type: String, enum: ['user', 'admin'], default: 'user'},
});

module.exports = mongoose.model("User", userSchema);
