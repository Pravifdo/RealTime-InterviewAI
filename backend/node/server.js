const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import models and utilities
const Evaluation = require('./src/models/Evaluation');
const InterviewTemplate = require('./src/models/InterviewTemplate');
const { extractKeywords, evaluateAnswer } = require('./src/utils/keywordExtractor');
const { evaluateAnswerWithAI, generateInterviewSummary } = require('./src/utils/aiEvaluator');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});
// Routes
const authRoutes = require('./src/controllers/authController');
const interviewRoutes = require('./src/routes/interviews');
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => console.error('❌ DB connection error:', err));


// Socket.io for real-time communication
let interviewerState ={camOn :true,micOn:true};
let participantState ={camOn :true,micOn:true};
let meetingState = false;
let meetingStartTime = null;
let meetingInterval = null;

// Helper function to get meeting time
function getMeetingTime() {
  if (!meetingState || !meetingStartTime) return 0;
  return Math.floor((Date.now() - meetingStartTime) / 1000);
}

// Socket.IO connection logging
io.engine.on("connection_error", (err) => {
  console.error("🔴 Socket.IO Connection Error:");
  console.error("  Code:", err.code);
  console.error("  Message:", err.message);
  console.error("  Context:", err.context);
});

console.log('Socket.io is running');

//Socket.io realtime connection
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id} from ${socket.handshake.address}`);

  //Send current states when user connects
  socket.emit("update-interviewer",interviewerState);
  socket.emit("update-participant",participantState);
  socket.emit('meeting-status', { meetingState, time: getMeetingTime()});

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, Reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`🔴 Socket error for ${socket.id}:`, error);
  });

  // WebRTC Signaling Events
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  //Interviewer toggles cam/mic
  socket.on("interviewer-toggle",(data) =>{
    interviewerState=data;
    console.log("Interviewer updated",interviewerState);
    io.emit("update-interviewer",interviewerState);
  });

  //Participant toggles cam/mic
  socket.on("participant-toggle",(data) =>{
    participantState=data;
    console.log("Participant updated",participantState);
    io.emit("update-participant",participantState);
  });

//Interviewer starts/ends meeting
 socket.on('start-meeting',()=>{
  if(!meetingState){
    meetingState=true;
    meetingStartTime=Date.now();
    console.log("Meeting started");
    io.emit('meeting-started');

    meetingInterval = setInterval(() => {
      io.emit('meeting-status', { meetingState, time: getMeetingTime() });
    }, 1000);
  }
 });

 socket.on('end-meeting', () => {
  if (meetingState) {
    meetingState = false;
    meetingStartTime = null;
    console.log("Meeting ended");
    io.emit('meeting-ended');
    
    if (meetingInterval) {
      clearInterval(meetingInterval);
      meetingInterval = null;
    }
  }
 });

 // Handle questions from interviewer with keywords
 socket.on('new-question', async (data) => {
   console.log("New question:", data);
   
   // data can be {question: string, keywords: []} or just a string
   const questionData = typeof data === 'string' 
     ? { question: data, keywords: [] }
     : data;
   
   // Auto-extract keywords if not provided
   if (!questionData.keywords || questionData.keywords.length === 0) {
     questionData.keywords = extractKeywords(questionData.question);
   }
   
   console.log("Question keywords:", questionData.keywords);
   io.emit('new-question', questionData);
 });

 // Handle answers from participant with auto-evaluation
 socket.on('new-answer', async (data) => {
   console.log("New answer received:", data);
   
   // data should be {answer: string, questionIndex: number, roomId: string, expectedKeywords: []}
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
           question: '', // Will be updated when question is sent
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
 
 // New event: Save question with keywords
 socket.on('save-question', async (data) => {
   const { question, keywords, roomId, questionIndex } = data;
   
   try {
     let session = await Evaluation.findOne({ roomId, status: 'ongoing' });
     
     if (!session) {
       session = new Evaluation({
         sessionId: `session-${Date.now()}`,
         roomId,
         questionsAnswers: []
       });
     }
     
     // Add or update question
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
     console.log("Question saved with keywords");
   } catch (error) {
     console.error("Error saving question:", error);
   }
 });

 // ==================== PRE-INTERVIEW SETUP EVENTS ====================
 
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
     
     // Create a room-specific copy or just use the template directly
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
         totalQuestions: template.questions.length
       });
       
       // Send to interviewer for tracking (without keywords for security)
       socket.emit('question-sent', {
         questionIndex,
         question: question.question,
         timestamp: new Date()
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
 
 // Evaluate participant answer using pre-saved keywords
 socket.on('submit-answer', async (data) => {
   const { roomId, questionIndex, answer, templateId } = data;
   
   try {
     // Try to find by templateId first, then fall back to roomId
     let template;
     if (templateId) {
       template = await InterviewTemplate.findById(templateId);
     } else {
       template = await InterviewTemplate.findOne({ roomId });
     }
     
     if (!template || !template.questions[questionIndex]) {
       throw new Error('Question template not found');
     }
     
     const question = template.questions[questionIndex];
     const expectedKeywords = question.expectedKeywords;
     
     console.log(`🤖 Starting AI evaluation for Q${questionIndex + 1}...`);
     
     // Use AI evaluation instead of keyword matching
     const evaluation = await evaluateAnswerWithAI(
       question.question,
       answer,
       expectedKeywords
     );
     
     console.log(`✨ AI Evaluation complete for Q${questionIndex + 1}:`, {
       score: evaluation.score,
       type: evaluation.evaluationType,
       concepts: evaluation.matchedConcepts.length
     });
     
     // Save to evaluation session
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
     
     // Broadcast AI evaluation results to interviewer
     io.to(roomId).emit('answer-evaluated', {
       questionIndex,
       score: evaluation.score,
       feedback: evaluation.feedback,
       strengths: evaluation.strengths,
       improvements: evaluation.improvements,
       matchedConcepts: evaluation.matchedConcepts,
       evaluationType: evaluation.evaluationType,
       averageScore: session.averageScore,
       totalQuestions: session.questionsAnswers.filter(qa => qa.participantAnswer).length
     });
     
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

  socket.on("disconnect",() =>{
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];
  
  // Get all IPv4 addresses
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddresses.push(iface.address);
      }
    });
  });
  
  console.log(`🚀 Server running on:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Digital Ocean: http://142.93.220.168:${PORT}`);
  ipAddresses.forEach(ip => {
    console.log(`   - Network: http://${ip}:${PORT}`);
  });
});
