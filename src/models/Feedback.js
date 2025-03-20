const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fb = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});
  
const feedbackSchema = new Schema({
    maidId: { type: Number, required: true },
    feedback: [fb]  // Embedded feedback subdocuments
});


module.exports = mongoose.model("Feedback", feedbackSchema);