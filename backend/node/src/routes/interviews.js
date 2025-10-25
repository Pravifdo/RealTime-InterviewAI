const express = require('express');
const router = express.Router();
const InterviewTemplate = require('../models/InterviewTemplate');

console.log('Interview routes loaded');
// Get all interview templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await InterviewTemplate.find({ status: { $ne: 'in-progress' } })
      .select('_id title questions status createdAt')
      .sort({ createdAt: -1 });
    
    const formatted = templates.map(t => ({
      id: t._id,
      title: t.title,
      questionCount: t.questions.length,
      status: t.status,
      createdAt: t.createdAt
    }));
    
    res.json({ success: true, templates: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific template by ID
router.get('/templates/:id', async (req, res) => {
  console.log("ssss");
  try {
    const template = await InterviewTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    res.json({ 
      success: true, 
      template: {
        id: template._id,
        title: template.title,
        questions: template.questions,
        status: template.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new interview template
router.post('/templates', async (req, res) => {
  try {
    const { title, questions } = req.body;
    
    const template = new InterviewTemplate({
      roomId: `template-${Date.now()}`,
      title: title || 'Untitled Interview',
      questions: questions.map((q, index) => ({
        question: q.question,
        expectedKeywords: q.keywords || [],
        category: q.category || 'General',
        difficulty: q.difficulty || 'Medium',
        order: index
      })),
      status: 'ready'
    });
    
    await template.save();
    
    res.json({ 
      success: true, 
      templateId: template._id,
      message: 'Template created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    await InterviewTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
