const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import models and utilities
const Evaluation = require('./src/models/Evaluation');
const { extractKeywords, evaluateAnswer } = require('./src/utils/keywordExtractor');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin:"*",
  }
});
// Routes
const authRoutes = require('./src/controllers/authController');
app.use('/api/auth', authRoutes);

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

//Socket.io realtime connection
io.on("connection",(socket) =>{
  console.log(`User connected: ${socket.id}`);

  //Send current states when user connects
  socket.emit("update-interviewer",interviewerState);
  socket.emit("update-participant",participantState);
  socket.emit('meeting-status', { meetingState, time: getMeetingTime()});

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

  socket.on("disconnect",() =>{
    console.log(`User disconnected: ${socket.id}`);
  });
});

console.log("Socket.io is running");
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
