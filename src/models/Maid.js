const mongoose = require("mongoose");

// function generateTimeSlots(startHour, endHour) {
//   let slots = [];
//   for (let hour = startHour; hour < endHour; hour++) {
//     let start = `${hour}:00`;
//     let end = `${hour + 1}:00`;
//     slots.push(`${start}-${end}`);
//   }
//   return slots;
// }

// const timeSlots = generateTimeSlots(7, 23);

const maidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender : {type: String, enum:["Male","Female"],required : true},
  govtId : {type : String, required:true},
  imageUrl : {type : String, default : ""},
  timeAvailable: [{ 
    type: String, 
    // enum: timeSlots, 
    required: true 
  }], 
  daysAvailable: [{ 
    type: String, 
    // enum: Dayslots, 
    required: true 
  }], 
  work : [{
    type: String, required : true
  }], // if maid can do cleaning or cooking or both
  pricePerService: { 
    type: Map, 
    of: Number, 
    required: true 
  }, // Key-value pair of service vs its price 
});

module.exports = mongoose.model("Maid", maidSchema);