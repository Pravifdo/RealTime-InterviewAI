const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');

// Import database connection
const connectDB = require('./src/config/database');

// Import socket handlers
const initializeSocketHandlers = require('./src/sockets');

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
const evaluationRoutes = require('./src/routes/evaluation');

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluation', evaluationRoutes);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

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
