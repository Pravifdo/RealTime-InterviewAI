/**
 * Question Socket Handlers
 * Handles new questions during interview - saves directly to database with ONE template per room
 */

const InterviewTemplate = require('../models/InterviewTemplate');
const Evaluation = require('../models/Evaluation');
const { extractKeywords } = require('../utils/keywordExtractor');

module.exports = (io, socket) => {
  // New question event - saves to database immediately with ONE template per room
  socket.on('new-question', async (data) => {
    console.log("📨 New question:", data);
    
    let roomId = null;
    let questionData;
    
    if (typeof data === 'string') {
      questionData = { question: data, keywords: [] };
      roomId = socket.roomId || Object.keys(socket.rooms).find(r => r.startsWith('room-'));
    } else {
      questionData = data;
      roomId = data.roomId || socket.roomId || Object.keys(socket.rooms).find(r => r.startsWith('room-'));
    }
    
    // Auto-extract keywords if not provided
    if (!questionData.keywords || questionData.keywords.length === 0) {
      questionData.keywords = extractKeywords(questionData.question);
    }
    
    console.log("Question keywords:", questionData.keywords);
    console.log("Room ID:", roomId);
    
    let templateId = null;
    let questionIndex = 0;
    
    // Save to InterviewTemplate (ONE template per room with status 'in-progress')
    if (roomId) {
      try {
        let template = await InterviewTemplate.findOne({ roomId, status: 'in-progress' });
        
        if (!template) {
          template = new InterviewTemplate({
            roomId,
            title: 'Live Interview',
            questions: [],
            status: 'in-progress'
          });
          console.log(`🆕 Created new template for room: ${roomId}`);
        }
        
        // Add question to template
        questionIndex = template.questions.length;
        template.questions.push({
          question: questionData.question,
          expectedKeywords: questionData.keywords || [],
          category: 'General',
          difficulty: 'Medium',
          order: questionIndex
        });
        
        await template.save();
        templateId = template._id.toString();
        console.log("Template ID:", templateId);
        console.log(`✅ Question saved to template (Q${questionIndex + 1}, ID: ${templateId}) for room: ${roomId}`);
        console.log(`🔑 Keywords for Gemini AI evaluation:`, questionData.keywords);
        
        // Emit receive-question with templateId (keywords saved for Gemini AI evaluation)
        io.to(roomId).emit('receive-question', {
          questionIndex,
          question: questionData.question,
          totalQuestions: template.questions.length,
          templateId: templateId,
          hasKeywords: questionData.keywords.length > 0
        });
        
        console.log(`📤 Question sent to room ${roomId} - Ready for answer → Gemini AI evaluation`);
        
      } catch (error) {
        console.error("Error saving question to template:", error);
      }
    } else {
      console.warn("⚠️ No roomId found, question not saved to template");
    }
  });

  // Save question with keywords (legacy event)
  socket.on('save-question', async (data) => {
    const { question, keywords, roomId, questionIndex } = data;
    
    try {
      // Save to Evaluation session
      let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
      
      if (!session) {
        session = new Evaluation({
          sessionId: `session-${Date.now()}`,
          roomId,
          questionsAnswers: []
        });
      }
      
      // Add or update question in evaluation
      if (session.questionsAnswers[questionIndex]) {
        session.questionsAnswers[questionIndex].question = question;
        session.questionsAnswers[questionIndex].expectedKeywords = keywords;
      } else {
        session.questionsAnswers.push({
          question,
          expectedKeywords: keywords,
          participantAnswer: '',
          score: 0
        });
      }
      
      await session.save();
      
      // ALSO save to InterviewTemplate for answer evaluation
      let template = await InterviewTemplate.findOne({ roomId, status: 'in-progress' });
      
      if (!template) {
        template = new InterviewTemplate({
          roomId,
          title: 'Ad-hoc Interview',
          questions: [],
          status: 'in-progress'
        });
      }
      
      // Add or update question in template
      if (template.questions[questionIndex]) {
        template.questions[questionIndex].question = question;
        template.questions[questionIndex].expectedKeywords = keywords || [];
      } else {
        template.questions.push({
          question,
          expectedKeywords: keywords || [],
          category: 'General',
          difficulty: 'Medium',
          order: questionIndex
        });
      }
      
      await template.save();
      templateId = template._id.toString();
      console.log("Template ID create:", templateId);
      console.log(`✅ Question saved to both Evaluation and Template (Q${questionIndex + 1})`);
      
    } catch (error) {
      console.error("Error saving question:", error);
    }
  });
};
