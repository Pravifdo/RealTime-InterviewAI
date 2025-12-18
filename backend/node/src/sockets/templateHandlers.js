/**
 * Template Socket Handlers
 * Handles template loading, saving, and pre-interview setup
 */

const InterviewTemplate = require('../models/InterviewTemplate');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

module.exports = (io, socket) => {
  // Load template by ID and assign to room with Gemini AI processing
  socket.on('load-template-by-id', async (data) => {
    const { templateId, roomId, processWithAI = true } = data;
    
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
      
      // Process template with Gemini AI if requested
      let aiAnalysis = null;
      if (processWithAI) {
        console.log('🤖 Processing template with Gemini AI...');
        aiAnalysis = await analyzeTemplateWithAI(template);
        console.log('✅ Gemini AI analysis complete');
      }
      
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
        roomId: roomId,
        aiAnalysis: aiAnalysis // Include AI insights
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

/**
 * Analyze interview template with Gemini AI
 * @param {Object} template - Interview template
 * @returns {Object} - AI analysis with insights and suggestions
 */
async function analyzeTemplateWithAI(template) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const questionsText = template.questions.map((q, i) => 
      `Q${i + 1}: ${q.question}\nKeywords: ${q.expectedKeywords.join(', ')}\nCategory: ${q.category}, Difficulty: ${q.difficulty}`
    ).join('\n\n');

    const prompt = `You are an expert technical interviewer. Analyze this interview template:

Title: ${template.title}
Total Questions: ${template.questions.length}

Questions:
${questionsText}

Provide analysis in JSON format:
{
  "overall_assessment": "<brief assessment of the template quality>",
  "difficulty_balance": "<comment on difficulty distribution>",
  "coverage": "<what technical areas are covered>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "estimated_duration": "<estimated time in minutes>",
  "strengths": ["<strength 1>", "<strength 2>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      overallAssessment: analysis.overall_assessment,
      difficultyBalance: analysis.difficulty_balance,
      coverage: analysis.coverage,
      suggestions: analysis.suggestions || [],
      estimatedDuration: analysis.estimated_duration,
      strengths: analysis.strengths || [],
      processedBy: 'Gemini AI'
    };
    
  } catch (error) {
    console.error('❌ Template AI Analysis Error:', error.message);
    return {
      overallAssessment: 'AI analysis unavailable',
      difficultyBalance: 'Not analyzed',
      coverage: 'Not analyzed',
      suggestions: [],
      estimatedDuration: `${template.questions.length * 5} minutes (estimated)`,
      strengths: [],
      processedBy: 'Fallback (AI unavailable)'
    };
  }
}
