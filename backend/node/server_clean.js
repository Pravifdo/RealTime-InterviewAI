const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import models
const Evaluation = require('./src/models/Evaluation');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
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

// ============================================
// API Routes
// ============================================

// Auth routes
const authRoutes = require('./src/controllers/authController');
app.use('/api/auth', authRoutes);

// Interview routes
const interviewRoutes = require('./src/routes/interviews');
app.use('/api/interviews', interviewRoutes);

// Evaluation routes
app.get('/api/evaluation', async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .sort({ createdAt: -1 })
      .select('roomId participantName averageScore totalQuestions questionsAnswered status questionsAnswers createdAt');
    
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluations' });
  }
});

app.get('/api/evaluation/my-evaluations', async (req, res) => {
  try {
    const userId = req.user?.id;
    const evaluations = await Evaluation.find({ participantId: userId })
      .sort({ createdAt: -1 })
      .select('roomId averageScore totalQuestions questionsAnswered status questionsAnswers createdAt');
    
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching user evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluations' });
  }
});

app.get('/api/evaluation/:sessionId', async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ sessionId: req.params.sessionId });
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }
    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluation' });
  }
});

// ============================================
// Database Connection
// ============================================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => console.error('❌ DB connection error:', err));

// ============================================
// Socket.IO Event Handlers (Modular)
// ============================================

const socketHandlers = require('./src/sockets');
socketHandlers(io);

// ============================================
// Start Server
// ============================================

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
