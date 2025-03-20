const Booking = require('../models/Booking');
const User = require('../models/User');
const Maid = require('../models/Maid');
const Feedback = require('../models/Feedback');

const submitFeedback = async (uid,data) => {
    try{
        const bookingId = data.bookingId;
        const booking = await Booking.findByPk(bookingId);
        const maidId = booking.maidId;

        let feedbackDoc = await Feedback.findOne({ maidId });
        if (!feedbackDoc){
            feedbackDoc = new Feedback({ maidId });
        }
        feedbackDoc.feedback.push({userId:uid,rating:data.rating,review:data.review});
        await feedbackDoc.save();
        const maid = await Maid.findByPk(maidId);
        if(maid.rating==null){
            maid.rating = 0;
        }
        let totalRating = maid.rating*maid.count;
        totalRating += data.rating;
        maid.count += 1;
        maid.rating = totalRating/maid.count;
        await maid.save();

        return {"message" : "Feedback submitted successfully"};
    }
    catch(error){
        throw new Error("Error submitting feedback: " + error.message);
    }
}
const getFeedbackById = async (id) => {
    try{
        const feedback = await Feedback.findOne({ maidId: id });
        return feedback;
    }
    catch(error){
        throw new Error("Error fetching feedback: " + error.message);
    }
}
module.exports = {submitFeedback,getFeedbackById};