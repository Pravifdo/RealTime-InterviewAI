/**
 * Template Socket Handlers
 * Handles template loading, saving, and pre-interview setup
 */

const InterviewTemplate = require('../models/InterviewTemplate');

module.exports = (io, socket) => {
  // Load template by ID and assign to room
  socket.on('load-template-by-id', async (data) => {
    const { templateId, roomId } = data;
    
    try {
      const template = await InterviewTemplate.findById(templateId);
      
      if (!template) {
        socket.emit('template-loaded', {
          success: false,
          error: 'Template not found'
        });
        return;
      }
      
      console.log(`📋 Loaded template "${template.title}" (ID: ${templateId}) for room ${roomId}`);
      console.log(`   Questions: ${template.questions.length}`);
      
      socket.emit('template-loaded', {
        success: true,
        templateId: template._id,
        title: template.title,
        questions: template.questions.map(q => ({
          question: q.question,
          keywords: q.expectedKeywords,
          category: q.category,
          difficulty: q.difficulty
        })),
        roomId: roomId
      });
      
    } catch (error) {
      console.error("Error loading template by ID:", error);
      socket.emit('template-loaded', {
        success: false,
        error: error.message
      });
    }
  });
  
  // Save pre-interview questions and keywords
  socket.on('save-interview-template', async (data) => {
    const { roomId, questions, title } = data;
    
    try {
      let template = await InterviewTemplate.findOne({ roomId });
      
      if (!template) {
        template = new InterviewTemplate({
          roomId,
          title: title || 'Technical Interview',
          questions: [],
          status: 'draft'
        });
      }
      
      template.questions = questions.map((q, index) => ({
        question: q.question,
        expectedKeywords: q.keywords || [],
        category: q.category || 'General',
        difficulty: q.difficulty || 'Medium',
        order: index
      }));
      
      template.status = 'ready';
      await template.save();
      
      console.log(`✅ Interview template saved for room ${roomId}:`, template.questions.length, 'questions');
      
      socket.emit('template-saved', {
        success: true,
        roomId,
        questionCount: template.questions.length
      });
      
    } catch (error) {
      console.error("Error saving interview template:", error);
      socket.emit('template-saved', {
        success: false,
        error: error.message
      });
    }
  });
  
  // Get pre-saved questions for a room
  socket.on('get-interview-template', async (roomId) => {
    try {
      const template = await InterviewTemplate.findOne({ roomId });
      
      if (template) {
        console.log(`📋 Retrieved template for room ${roomId}:`, template.questions.length, 'questions');
        socket.emit('template-loaded', {
          success: true,
          questions: template.questions,
          title: template.title,
          status: template.status
        });
      } else {
        socket.emit('template-loaded', {
          success: false,
          message: 'No template found for this room'
        });
      }
    } catch (error) {
      console.error("Error loading interview template:", error);
      socket.emit('template-loaded', {
        success: false,
        error: error.message
      });
    }
  });
  
  // Ask a question during interview (using pre-saved keywords)
  socket.on('ask-question', async (data) => {
    const { roomId, questionIndex, templateId } = data;
    
    try {
      // Try to find by templateId first, then fall back to roomId
      let template;
      if (templateId) {
        template = await InterviewTemplate.findById(templateId);
      } else {
        template = await InterviewTemplate.findOne({ roomId });
      }
      
      if (template && template.questions[questionIndex]) {
        const question = template.questions[questionIndex];
        
        console.log(`📝 Asking question ${questionIndex + 1}:`, question.question);
        console.log(`🔑 Expected keywords (hidden from interviewer):`, question.expectedKeywords);
        
        // Send question to participant (without keywords)
        io.to(roomId).emit('receive-question', {
          questionIndex,
          question: question.question,
          totalQuestions: template.questions.length,
          templateId: templateId || template._id.toString()
        });
        
      } else {
        socket.emit('question-error', {
          message: 'Question not found in template'
        });
      }
    } catch (error) {
      console.error("Error asking question:", error);
      socket.emit('question-error', {
        error: error.message
      });
    }
  });
};
