/**
 * Answer Socket Handlers
 * Handles answer submission and on-demand AI evaluation
 */

const Evaluation = require('../models/Evaluation');
const InterviewTemplate = require('../models/InterviewTemplate');
const { evaluateAnswer } = require('../utils/keywordExtractor');
const { evaluateAnswerWithAI } = require('../utils/aiEvaluator');

module.exports = (io, socket) => {
  // Direct participant answer event - forwards answer to interviewer immediately (NO auto-evaluation)
  socket.on('participant-answer', (data) => {
    const { roomId, questionIndex, answer, question } = data;
    console.log(`📨 Direct answer from participant for Q${questionIndex + 1} in room ${roomId}`);
    
    // Broadcast to room (interviewer will receive this) - answer only, no evaluation yet
    io.to(roomId).emit('participant-answer-received', {
      questionIndex,
      answer,
      question,
      timestamp: new Date(),
      evaluated: false  // Flag to show "Evaluate" button
    });
    
    console.log(`📡 Answer forwarded to room ${roomId} (awaiting manual evaluation)`);
  });

  // Submit answer event - just saves the answer, NO automatic AI evaluation
  socket.on('submit-answer', async (data) => {
    const { roomId, questionIndex, answer, templateId, question: providedQuestion } = data;
    
    console.log('📥 Answer submission received (no auto-eval):', {
      roomId,
      questionIndex,
      templateId,
      hasAnswer: !!answer
    });
    
    try {
      // Find or create template - try multiple approaches
      let template;
      
      // 1. Try by templateId first
      if (templateId) {
        console.log(`🔍 Looking for template by ID: ${templateId}`);
        template = await InterviewTemplate.findById(templateId);
        if (template) console.log(`✅ Found template by ID: ${template.title}`);
      }
      
      // 2. Try by roomId with status 'in-progress'
      if (!template && roomId) {
        console.log(`🔍 Looking for template by roomId (in-progress): ${roomId}`);
        template = await InterviewTemplate.findOne({ roomId, status: 'in-progress' });
        if (template) console.log(`✅ Found template by roomId (in-progress): ${template.title}`);
      }
      
      // 3. Try by roomId without status filter
      if (!template && roomId) {
        console.log(`🔍 Looking for template by roomId (any status): ${roomId}`);
        template = await InterviewTemplate.findOne({ roomId });
        if (template) console.log(`✅ Found template by roomId: ${template.title}`);
      }
      
      // 4. Create new template if none found
      if (!template) {
        console.log(`📝 Creating new template for room: ${roomId}`);
        template = new InterviewTemplate({
          roomId,
          title: 'Live Interview',
          questions: [],
          status: 'in-progress'
        });
        await template.save();
        console.log(`✅ New template created with ID: ${template._id}`);
      }
      
      // If question doesn't exist at this index, add it
      if (!template.questions[questionIndex]) {
        console.log(`📝 Adding question at index ${questionIndex}`);
        while (template.questions.length <= questionIndex) {
          template.questions.push({
            question: providedQuestion || `Question ${template.questions.length + 1}`,
            expectedKeywords: [],
            category: 'General',
            difficulty: 'Medium',
            order: template.questions.length
          });
        }
        await template.save();
      }
      
      // Save answer to evaluation session (without AI evaluation)
      let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
      
      if (!session) {
        session = new Evaluation({
          sessionId: `session-${Date.now()}`,
          roomId,
          questionsAnswers: []
        });
      }
      
      // Ensure array has enough elements
      while (session.questionsAnswers.length <= questionIndex) {
        session.questionsAnswers.push({
          question: '',
          expectedKeywords: [],
          participantAnswer: '',
          score: 0
        });
      }
      
      // Save answer (no score yet - will be evaluated on demand)
      session.questionsAnswers[questionIndex] = {
        question: template.questions[questionIndex]?.question || providedQuestion,
        expectedKeywords: template.questions[questionIndex]?.expectedKeywords || [],
        participantAnswer: answer,
        score: null,  // Not evaluated yet
        evaluated: false,
        timestamp: new Date()
      };
      
      await session.save();
      console.log(`💾 Answer saved for Q${questionIndex + 1} (awaiting evaluation)`);
      
      // Confirm to participant
      socket.emit('answer-submitted', {
        success: true,
        questionIndex,
        templateId: template._id.toString()  // Send back the templateId for future use
      });
      
    } catch (error) {
      console.error("Error saving answer:", error);
      socket.emit('answer-submitted', {
        success: false,
        error: error.message
      });
    }
  });

  // ON-DEMAND AI EVALUATION - Called when interviewer clicks "Evaluate" button
  socket.on('evaluate-answer', async (data) => {
    const { roomId, questionIndex, answer, question, templateId } = data;
    
    console.log(`\n🎯 ===== ON-DEMAND GEMINI AI EVALUATION =====`);
    console.log(`📋 Room: ${roomId}, Question: ${questionIndex + 1}`);
    
    try {
      // Find template for expected keywords
      let template;
      if (templateId) {
        template = await InterviewTemplate.findById(templateId);
      }
      if (!template) {
        template = await InterviewTemplate.findOne({ roomId, status: 'in-progress' });
      }
      
      const templateQuestion = template?.questions?.[questionIndex];
      const expectedKeywords = templateQuestion?.expectedKeywords || [];
      const questionText = templateQuestion?.question || question;
      
      console.log(`❓ Question: ${questionText}`);
      console.log(`🔑 Expected Keywords:`, expectedKeywords);
      console.log(`💬 Answer: ${answer?.substring(0, 100)}...`);
      console.log(`🤖 Sending to Gemini AI for evaluation...`);
      
      // Emit evaluating status
      io.to(roomId).emit('evaluation-started', {
        questionIndex,
        status: 'evaluating'
      });
      
      // Call Gemini AI for evaluation
      const evaluation = await evaluateAnswerWithAI(
        questionText,
        answer,
        expectedKeywords
      );
      
      console.log(`✅ Gemini AI Evaluation complete:`);
      console.log(`   📊 Score: ${evaluation.score}/100`);
      console.log(`   🎯 Matched Concepts:`, evaluation.matchedConcepts);
      console.log(`   💡 Feedback: ${evaluation.feedback?.substring(0, 100)}...`);
      
      // Calculate points (out of 10)
      const points = Math.round(evaluation.score / 10);
      
      // Update evaluation session in database
      let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
      if (session && session.questionsAnswers[questionIndex]) {
        session.questionsAnswers[questionIndex].score = evaluation.score;
        session.questionsAnswers[questionIndex].aiFeedback = evaluation.feedback;
        session.questionsAnswers[questionIndex].aiStrengths = evaluation.strengths;
        session.questionsAnswers[questionIndex].aiImprovements = evaluation.improvements;
        session.questionsAnswers[questionIndex].matchedKeywords = evaluation.matchedConcepts;
        session.questionsAnswers[questionIndex].evaluated = true;
        session.questionsAnswers[questionIndex].points = points;
        session.calculateAverage();
        await session.save();
      }
      
      // Broadcast evaluation results to room
      io.to(roomId).emit('answer-evaluated', {
        questionIndex,
        answer,
        question: questionText,
        expectedKeywords,
        score: evaluation.score,
        points: points,  // Points out of 10
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        matchedConcepts: evaluation.matchedConcepts || [],
        evaluationType: evaluation.evaluationType || 'Gemini AI',
        averageScore: session?.averageScore || evaluation.score,
        evaluated: true
      });
      
      console.log(`📡 Evaluation results sent to room ${roomId}`);
      console.log(`🎯 ===== END EVALUATION =====\n`);
      
    } catch (error) {
      console.error("❌ Error during AI evaluation:", error);
      io.to(roomId).emit('evaluation-error', {
        questionIndex,
        error: error.message
      });
    }
  });

  // Legacy new-answer event for backward compatibility
  socket.on('new-answer', async (data) => {
    console.log("New answer received (legacy):", data);
    
    const { answer, questionIndex, roomId, expectedKeywords = [] } = typeof data === 'string'
      ? { answer: data, questionIndex: 0, roomId: socket.roomId, expectedKeywords: [] }
      : data;
    
    // Just forward the answer without evaluation
    io.to(roomId).emit('participant-answer-received', {
      questionIndex,
      answer,
      evaluated: false
    });
  });
};
