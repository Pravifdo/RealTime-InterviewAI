const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

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

 // Handle questions from interviewer
 socket.on('new-question', (question) => {
   console.log("New question:", question);
   io.emit('new-question', question);
 });

 // Handle answers from participant
 socket.on('new-answer', (answer) => {
   console.log("New answer:", answer);
   io.emit('new-answer', answer);
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
