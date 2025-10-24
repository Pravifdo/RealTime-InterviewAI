import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaClock, FaUserGraduate, FaUserTie, FaQuestionCircle, FaComment, FaSignInAlt } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";

// Use environment variable or fallback to localhost
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL);

export default function JoinParticipant() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [time, setTime] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [interviewerState, setInterviewerState] = useState({ camOn: true, micOn: true });
  const [roomID, setRoomID] = useState('');
  const [roomIDInput, setRoomIDInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Check for Room ID in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromURL = urlParams.get('room');
    
    if (roomFromURL) {
      console.log('🔗 Room ID detected in URL:', roomFromURL);
      setRoomIDInput(roomFromURL);
      setRoomID(roomFromURL);
      setIsJoined(true);
      console.log('✅ Auto-joining room:', roomFromURL);
    }
  }, []);

  // Initialize WebRTC only after joining room
  const {
    localStream,
    remoteStream,
    isConnected,
    error,
    initLocalStream,
    toggleVideo,
    toggleAudio,
    cleanup,
  } = useWebRTC(socket, roomID, false);

  // Initialize local stream on mount only after joining
  useEffect(() => {
    if (isJoined && roomID) {
      initLocalStream(camOn, micOn);
      console.log('🔗 Joined Room:', roomID);
    }
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJoined, roomID]);

  // Update local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.error('Error playing remote video:', err);
      });
    }
  }, [remoteStream]);

  useEffect(() => {
    socket.on("update-interviewer", setInterviewerState);
    socket.on("new-question", q => setQuestions(prev => [...prev, q]));
    socket.on("meeting-status", data => setTime(data.time));
    socket.on("meeting-ended", () => {
      alert("Interview ended by interviewer");
      setTime(0);
    });

    return () => {
      socket.off("update-interviewer");
      socket.off("new-question");
      socket.off("meeting-status");
      socket.off("meeting-ended");
    };
  }, []);

  const toggleMic = () => {
    const newMicState = !micOn;
    setMicOn(newMicState);
    toggleAudio(newMicState);
    socket.emit("participant-toggle", { micOn: newMicState, camOn });
  };

  const toggleCam = () => {
    const newCamState = !camOn;
    setCamOn(newCamState);
    toggleVideo(newCamState);
    socket.emit("participant-toggle", { micOn, camOn: newCamState });
  };

  const sendAnswer = () => {
    if(!answer.trim()) return;
    socket.emit("new-answer", answer);
    setAnswer("");
  };

  const handleJoinRoom = () => {
    if (!roomIDInput.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    setRoomID(roomIDInput.trim());
    setIsJoined(true);
    console.log('🔗 Attempting to join room:', roomIDInput.trim());
  };

  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Show Room ID entry screen if not joined
  if (!isJoined) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <FaUserGraduate style={{ fontSize: '60px', color: '#667eea', marginBottom: '15px' }} />
            <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>Join Interview</h1>
            <p style={{ color: '#666', margin: 0 }}>Enter the Room ID provided by the interviewer</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Room ID
            </label>
            <input
              type="text"
              value={roomIDInput}
              onChange={(e) => setRoomIDInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Enter room ID (e.g., room-abc123)"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                letterSpacing: '1px'
              }}
              autoFocus
            />
          </div>

          <button
            onClick={handleJoinRoom}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaSignInAlt />
            Join Interview Room
          </button>

          <div style={{
            marginTop: '25px',
            padding: '15px',
            backgroundColor: '#f0f4ff',
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
              ℹ️ Instructions:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
              <li>Get the Room ID from your interviewer</li>
              <li>Enter it exactly as provided</li>
              <li>You'll be connected to the interview session</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="participant-dashboard">
      {/* Room ID Display Banner */}
      {roomID && (
        <div style={{
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span>🔗 Connected to Room:</span>
          <code style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '15px',
            letterSpacing: '1px',
            fontWeight: 'bold'
          }}>{roomID}</code>
        </div>
      )}
      
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-info">
            <div className="user-avatar">
              <FaUserGraduate />
            </div>
            <div>
              <h1>Participant Dashboard</h1>
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="timer-section">
          <div className="timer">
            <FaClock className="timer-icon" />
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid">
        {/* Local Video Card */}
        <div className="video-card local-video">
          <div className="video-header">
            <div className="video-title">
              <FaUserGraduate className="title-icon" />
              <span>Your Camera</span>
            </div>
            <div className="video-status">
              {localStream && <span className="stream-indicator">● LIVE</span>}
            </div>
          </div>
          
          <div className="video-container">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline
              className="video-element"
            />
            {!camOn && (
              <div className="camera-off-overlay">
                <FaVideoSlash className="camera-off-icon" />
                <span>Camera Off</span>
              </div>
            )}
          </div>

          <div className="video-controls">
            <button 
              className={`control-btn ${micOn ? 'active' : 'muted'}`}
              onClick={toggleMic}
              title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              <span>{micOn ? 'Mute' : 'Unmute'}</span>
            </button>
            
            <button 
              className={`control-btn ${camOn ? 'active' : 'muted'}`}
              onClick={toggleCam}
              title={camOn ? 'Turn off Camera' : 'Turn on Camera'}
            >
              {camOn ? <FaVideo /> : <FaVideoSlash />}
              <span>{camOn ? 'Stop Video' : 'Start Video'}</span>
            </button>
          </div>
        </div>

        {/* Remote Video Card */}
        <div className="video-card remote-video">
          <div className="video-header">
            <div className="video-title">
              <FaUserTie className="title-icon" />
              <span>Interviewer</span>
            </div>
            <div className="video-status">
              {remoteStream && <span className="stream-indicator">● LIVE</span>}
            </div>
          </div>
          
          <div className="video-container">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              className="video-element"
            />
            
            {(!remoteStream || !interviewerState.camOn) && (
              <div className="camera-off-overlay">
                <FaVideoSlash className="camera-off-icon" />
                <span>
                  {!remoteStream ? 'Waiting for interviewer...' : 'Interviewer camera is off'}
                </span>
              </div>
            )}
          </div>

          <div className="video-controls">
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Camera:</span>
                <span className={`status-value ${interviewerState.camOn ? 'on' : 'off'}`}>
                  {interviewerState.camOn ? 'On' : 'Off'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Microphone:</span>
                <span className={`status-value ${interviewerState.micOn ? 'on' : 'off'}`}>
                  {interviewerState.micOn ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Questions Panel */}
        <div className="content-card questions-panel">
          <div className="card-header">
            <FaQuestionCircle className="card-icon" />
            <h3>Interview Questions</h3>
            <span className="badge">{questions.length}</span>
          </div>
          
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <FaQuestionCircle className="empty-icon" />
                <p>No questions yet</p>
                <span>Questions from the interviewer will appear here</span>
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={i} className="question-item">
                  <div className="question-number">Q{i + 1}</div>
                  <div className="question-text">{q}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Answer Panel */}
        <div className="content-card answer-panel">
          <div className="card-header">
            <FaComment className="card-icon" />
            <h3>Your Answers</h3>
          </div>
          
          <div className="answer-input-section">
            <textarea 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="Type your answer to the interviewer's questions here..."
              className="answer-textarea"
              rows="4"
            />
            
            <button 
              className={`send-button ${answer.trim() ? 'active' : 'disabled'}`}
              onClick={sendAnswer}
              disabled={!answer.trim()}
            >
              <FaPaperPlane className="send-icon" />
              Send Answer
            </button>
          </div>

          {questions.length > 0 && (
            <div className="answer-hint">
              💡 You have {questions.length} question{questions.length > 1 ? 's' : ''} to answer
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .participant-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Header Styles */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .user-info h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .connection-status.connected .status-dot {
          background: #48bb78;
        }

        .connection-status.disconnected .status-dot {
          background: #f56565;
        }

        .timer-section {
          display: flex;
          align-items: center;
        }

        .timer {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #2d3748;
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
        }

        .timer-icon {
          color: #ffd700;
        }

        /* Error Alert */
        .error-alert {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          color: #c53030;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Video Grid */
        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .video-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .video-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2d3748;
        }

        .title-icon {
          color: #667eea;
        }

        .stream-indicator {
          color: #48bb78;
          font-size: 12px;
          font-weight: 600;
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-off-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #1a202c;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #718096;
          gap: 12px;
        }

        .camera-off-icon {
          font-size: 48px;
        }

        .video-controls {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn.active {
          background: #48bb78;
          color: white;
        }

        .control-btn.muted {
          background: #f56565;
          color: white;
        }

        .control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .status-info {
          display: flex;
          gap: 20px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-label {
          font-size: 14px;
          color: #718096;
        }

        .status-value {
          font-weight: 600;
          font-size: 14px;
        }

        .status-value.on {
          color: #48bb78;
        }

        .status-value.off {
          color: #f56565;
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .content-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #2d3748;
        }

        .card-icon {
          color: #667eea;
          font-size: 20px;
        }

        .badge {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Questions Panel */
        .questions-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-state p {
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .empty-state span {
          font-size: 14px;
        }

        .question-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
        }

        .question-number {
          background: #667eea;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .question-text {
          color: #2d3748;
          line-height: 1.5;
        }

        /* Answer Panel */
        .answer-input-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .answer-textarea {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s ease;
        }

        .answer-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-button.active {
          background: #667eea;
          color: white;
        }

        .send-button.disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        .send-button.active:hover {
          background: #5a6fd8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .answer-hint {
          margin-top: 16px;
          padding: 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          color: #856404;
          font-size: 14px;
          text-align: center;
        }

        /* Scrollbar Styling */
        .questions-list::-webkit-scrollbar {
          width: 6px;
        }

        .questions-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .questions-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .questions-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .video-grid,
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .participant-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .status-info {
            flex-direction: column;
            gap: 8px;
          }

          .video-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}