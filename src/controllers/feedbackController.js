const feedbackService = require('../services/feedbackService');


const submitFeedback = async (req, res) => {
    try {
        const feedback = await feedbackService.submitFeedback(req.user.id, req.body);
        return res.status(200).json(feedback);
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const getFeedbackById = async (req,res) => {
    try{
        const feedback = await feedbackService.getFeedbackById(req.params.id);
        return res.status(200).json(feedback);
    }
    catch(error){
        console.error('Error in getFeedbackById:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {submitFeedback,getFeedbackById};
