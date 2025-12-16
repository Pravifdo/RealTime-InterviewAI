/**
 * WebRTC Socket Handlers
 * Handles WebRTC signaling events for video/audio communication
 */

module.exports = (io, socket) => {
  // Join a room
  socket.on('join-room', (roomId) => {
    console.log(`👤 Socket ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // WebRTC Offer
  socket.on('offer', (data) => {
    console.log(`📞 Offer from ${socket.id} to room ${data.room}`);
    socket.to(data.room).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  // WebRTC Answer
  socket.on('answer', (data) => {
    console.log(`📞 Answer from ${socket.id} to room ${data.room}`);
    socket.to(data.room).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  // ICE Candidate
  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE candidate from ${socket.id} to room ${data.room}`);
    socket.to(data.room).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });
};
