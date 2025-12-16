const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// Get all evaluations
router.get('/', async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .sort({ createdAt: -1 })
      .select('roomId participantName averageScore totalQuestions questionsAnswered status questionsAnswers createdAt');
    
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluations' });
  }
});

// Get user's evaluations
router.get('/my-evaluations', async (req, res) => {
  try {
    const userId = req.user?.id; // If using auth middleware
    const evaluations = await Evaluation.find({ participantId: userId })
      .sort({ createdAt: -1 })
      .select('roomId averageScore totalQuestions questionsAnswered status questionsAnswers createdAt');
    
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching user evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluations' });
  }
});

// Get evaluation by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ sessionId: req.params.sessionId });
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluation' });
  }
});

module.exports = router;
