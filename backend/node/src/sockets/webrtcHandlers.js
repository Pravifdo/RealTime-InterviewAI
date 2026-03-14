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
    // Emit user-joined to others in the room (triggers WebRTC call initiation)
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`✅ Emitted user-joined for socket ${socket.id} in room ${roomId}`);
  });

  // WebRTC Offer
  socket.on('offer', (data) => {
    const roomId = data.roomId || data.room;
    console.log(`📞 Offer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  // WebRTC Answer
  socket.on('answer', (data) => {
    const roomId = data.roomId || data.room;
    console.log(`📞 Answer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  // ICE Candidate
  socket.on('ice-candidate', (data) => {
    const roomId = data.roomId || data.room;
    console.log(`🧊 ICE candidate from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });
};
