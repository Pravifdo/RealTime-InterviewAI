/**
 * Socket.IO Event Handlers - Main Entry Point
 * Registers all socket event handlers in a modular way
 */

const webrtcHandlers = require('./webrtcHandlers');
const meetingHandlers = require('./meetingHandlers');
const questionHandlers = require('./questionHandlers');
const answerHandlers = require('./answerHandlers');
const templateHandlers = require('./templateHandlers');

module.exports = (io) => {
  // Connection error logging
  io.engine.on("connection_error", (err) => {
    console.error("🔴 Socket.IO Connection Error:");
    console.error("  Code:", err.code);
    console.error("  Message:", err.message);
    console.error("  Context:", err.context);
  });

  console.log('Socket.io is running');

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id} from ${socket.handshake.address}`);

    // DEBUG: Log ALL incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`🔵 [${socket.id}] Event received: ${eventName}`, JSON.stringify(args).substring(0, 200));
    });

    // Register all event handlers
    webrtcHandlers(io, socket);
    meetingHandlers(io, socket);
    questionHandlers(io, socket);
    answerHandlers(io, socket);
    templateHandlers(io, socket);

    // General disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`🔴 Socket error for ${socket.id}:`, error);
    });
  });
};
