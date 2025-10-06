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
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('❌ DB connection error:', err));


// Socket.io for real-time communication
let interviewerState ={camOn :true,micOn:true};
let participantState ={camOn :true,micOn:true};
let meetingState = false;
let meetingStartTime = null;
let meetingInterval = null;

//Socket.io realtime connection
io.on("connection",(socket) =>{
  console.log(`User connected: ${socket.id}`);

  //Send current states when user connects
  socket.emit("update-interviewer",interviewerState);
  socket.emit("update-participant",participantState);
  socket.emit('meeting-status', { meetingState, time: getMeetingTime()});

  //Interviewer toggles cam/mic
  socket.on("interviewer-toggle",(data) =>{
    interviewerState=data;
    console.timeLog("Interviewr updated",interviewerState);
    io.emit("update-interviewer",interviewerState);
  });

  //Participant toggles cam/mic
  socket.on("particicipant-toggle",(data) =>{
    participantState=data;
    console.timeLog("Participant updated",participantState);
    io.emit("update-participant",participantState);
  });

//Innterviewer starts/ends meeting
 socket.on('start-meeting',()=>{
  if(!meetingStarted){
    meetingState=true;
    meetingStartTime=Date.now();
    console.log("Meeting started");
    io.emit('meeting-started');

    meetingInterval =
  }
 });

  socket.on("disconnect",() =>{
    console.log(`User disconnected: ${socket.id}`);
  });
  console.log("Socket.io is running");
  const PORT = process.env.PORT || 5000;
  server.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`);
  })
});
