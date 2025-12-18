/**
 * Answer Socket Handlers
 * Handles answer submission and evaluation with AI
 */

const Evaluation = require('../models/Evaluation');
const InterviewTemplate = require('../models/InterviewTemplate');
const { evaluateAnswer } = require('../utils/keywordExtractor');
const { evaluateAnswerWithAI } = require('../utils/aiEvaluator');

module.exports = (io, socket) => {
  // Submit answer event - evaluates with AI using template
  socket.on('submit-answer', async (data) => {
    const { roomId, questionIndex, answer, templateId } = data;
    
    console.log('📥 Answer submission received:', {
      roomId,
      questionIndex,
      templateId,
      hasAnswer: !!answer
    });
    
    try {
      // Find template by templateId or roomId
      let template;
      if (templateId) {
        console.log(`🔍 Looking up template by ID: ${templateId}`);
        template = await InterviewTemplate.findById(templateId);
      }
      
      if (!template) {
        console.log(`🔍 Template not found by ID, trying roomId: ${roomId}`);
        template = await InterviewTemplate.findOne({ roomId, status: 'in-progress' });
      }
      
      if (!template) {
        console.error(`❌ No template found for templateId: ${templateId}, roomId: ${roomId}`);
        throw new Error('Question template not found');
      }
      
      if (!template.questions[questionIndex]) {
        console.error(`❌ Question index ${questionIndex} not found in template`);
        throw new Error('Question not found in template');
      }
      
      const question = template.questions[questionIndex];
      const expectedKeywords = question.expectedKeywords;
      
      console.log(`\n🎯 ===== GEMINI AI EVALUATION FLOW =====`);
      console.log(`📋 Template: ${template.title}`);
      console.log(`❓ Question ${questionIndex + 1}: ${question.question}`);
      console.log(`🔑 Template Keywords:`, expectedKeywords);
      console.log(`💬 Participant Answer:`, answer.substring(0, 100) + '...');
      console.log(`🤖 Sending to Gemini AI for evaluation...`);
      
      // Use AI evaluation with Gemini (passes template keywords to AI)
      const evaluation = await evaluateAnswerWithAI(
        question.question,
        answer,
        expectedKeywords
      );
      
      console.log(`✅ Gemini AI Evaluation complete for Q${questionIndex + 1}:`);
      console.log(`   📊 Score: ${evaluation.score}/100`);
      console.log(`   🎯 Matched Keywords:`, evaluation.matchedConcepts);
      console.log(`   ⚙️ Evaluation Type: ${evaluation.evaluationType}`);
      console.log(`🎯 ===== END EVALUATION =====\n`);
      
      // Save to evaluation session database
      let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
      
      if (!session) {
        session = new Evaluation({
          sessionId: `session-${Date.now()}`,
          roomId,
          questionsAnswers: []
        });
      }
      
      // Ensure question exists in session
      while (session.questionsAnswers.length <= questionIndex) {
        session.questionsAnswers.push({
          question: '',
          expectedKeywords: [],
          participantAnswer: '',
          score: 0
        });
      }
      
      // Update with answer and AI evaluation
      session.questionsAnswers[questionIndex] = {
        question: question.question,
        expectedKeywords: expectedKeywords,
        participantAnswer: answer,
        extractedKeywords: evaluation.matchedConcepts || [],
        matchedKeywords: evaluation.matchedConcepts || [],
        score: evaluation.score,
        aiFeedback: evaluation.feedback,
        aiStrengths: evaluation.strengths,
        aiImprovements: evaluation.improvements,
        evaluationType: evaluation.evaluationType,
        timestamp: new Date()
      };
      
      // Calculate average
      session.calculateAverage();
      await session.save();
      
      console.log(`💾 AI Evaluation saved. Average score: ${session.averageScore}%`);
      
      // Broadcast Gemini AI evaluation results to BOTH interviewer and participant
      io.to(roomId).emit('answer-evaluated', {
        questionIndex,
        answer: answer,
        question: question.question,
        templateKeywords: expectedKeywords,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        matchedConcepts: evaluation.matchedConcepts,
        evaluationType: evaluation.evaluationType,
        averageScore: session.averageScore,
        totalQuestions: session.questionsAnswers.filter(qa => qa.participantAnswer).length,
        processedByAI: 'Gemini AI',
        keywordsChecked: true
      });
      
      console.log(`📡 Gemini AI results broadcast to room ${roomId} (Interviewer + Participant)`);
      
      // Confirm to participant
      socket.emit('answer-submitted', {
        success: true,
        questionIndex
      });
      
    } catch (error) {
      console.error("Error evaluating answer:", error);
      socket.emit('answer-submitted', {
        success: false,
        error: error.message
      });
    }
  });

  // Legacy new-answer event for backward compatibility
  socket.on('new-answer', async (data) => {
    console.log("New answer received:", data);
    
    const { answer, questionIndex, roomId, expectedKeywords = [] } = typeof data === 'string'
      ? { answer: data, questionIndex: 0, roomId: socket.roomId, expectedKeywords: [] }
      : data;
    
    try {
      // Evaluate the answer
      const evaluation = evaluateAnswer(answer, expectedKeywords);
      
      console.log("Answer evaluation:", {
        score: evaluation.score,
        matchedKeywords: evaluation.matchedKeywords,
        participantKeywords: evaluation.participantKeywords
      });
      
      // Broadcast evaluation results
      io.emit('answer-evaluated', {
        questionIndex,
        answer,
        evaluation: {
          score: evaluation.score,
          matchedKeywords: evaluation.matchedKeywords,
          participantKeywords: evaluation.participantKeywords,
          matchPercentage: evaluation.matchPercentage
        }
      });
      
      // Save to database if roomId exists
      if (roomId) {
        let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
        
        if (!session) {
          session = new Evaluation({
            sessionId: `session-${Date.now()}`,
            roomId,
            questionsAnswers: []
          });
        }
        
        // Update or add question-answer
        if (session.questionsAnswers[questionIndex]) {
          session.questionsAnswers[questionIndex].participantAnswer = answer;
          session.questionsAnswers[questionIndex].extractedKeywords = evaluation.participantKeywords;
          session.questionsAnswers[questionIndex].matchedKeywords = evaluation.matchedKeywords;
          session.questionsAnswers[questionIndex].score = evaluation.score;
        } else {
          session.questionsAnswers.push({
            question: '',
            expectedKeywords,
            participantAnswer: answer,
            extractedKeywords: evaluation.participantKeywords,
            matchedKeywords: evaluation.matchedKeywords,
            score: evaluation.score
          });
        }
        
        // Calculate average
        session.calculateAverage();
        await session.save();
        
        console.log("Evaluation saved. Average score:", session.averageScore);
        
        // Broadcast updated scores
        io.emit('scores-updated', {
          averageScore: session.averageScore,
          totalQuestions: session.totalQuestions,
          scores: session.questionsAnswers.map(qa => qa.score)
        });
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
    }
  });
};
