/**
 * Meeting Control Socket Handlers
 * Handles meeting lifecycle events (start, end, toggle controls)
 */

// Meeting state variables
let interviewerState = { camOn: true, micOn: true };
let participantState = { camOn: true, micOn: true };
let meetingState = false;
let meetingStartTime = null;
let meetingInterval = null;

// Helper function to get meeting time
function getMeetingTime() {
  if (!meetingState || !meetingStartTime) return 0;
  return Math.floor((Date.now() - meetingStartTime) / 1000);
}

module.exports = (io, socket) => {
  // Interviewer toggle controls
  socket.on("interviewer-toggle", (data) => {
    interviewerState = data;
    console.log("Interviewer state:", interviewerState);
    io.emit("update-interviewer", interviewerState);
  });

  // Participant toggle controls
  socket.on("participant-toggle", (data) => {
    participantState = data;
    console.log("Participant state:", participantState);
    io.emit("update-participant", participantState);
  });

  // Start meeting
  socket.on('start-meeting', () => {
    meetingState = true;
    meetingStartTime = Date.now();
    console.log('🎬 Meeting started');
    io.emit('meeting-started');
    
    // Broadcast time every second
    if (meetingInterval) clearInterval(meetingInterval);
    meetingInterval = setInterval(() => {
      io.emit('meeting-status', { time: getMeetingTime() });
    }, 1000);
  });

  // End meeting
  socket.on('end-meeting', () => {
    meetingState = false;
    if (meetingInterval) {
      clearInterval(meetingInterval);
      meetingInterval = null;
    }
    console.log('🛑 Meeting ended');
    io.emit('meeting-ended');
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
    if (meetingInterval && io.engine.clientsCount === 0) {
      clearInterval(meetingInterval);
      meetingInterval = null;
      meetingState = false;
    }
  });
};

// Export state getters for use in other modules
module.exports.getState = () => ({
  interviewerState,
  participantState,
  meetingState,
  meetingTime: getMeetingTime()
});
