import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaClock, FaUserTie, FaUserGraduate, FaPlay, FaStop, FaQuestionCircle } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";

const socket = io("http://localhost:5000");
const ROOM_ID = "interview-room";

export default function JoinInterview() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [time, setTime] = useState(0);
  const [question, setQuestion] = useState("");
  const [participantState, setParticipantState] = useState({ camOn: true, micOn: true });
  const [meetingStarted, setMeetingStarted] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize WebRTC (interviewer is the initiator)
  const {
    localStream,
    remoteStream,
    isConnected,
    error,
    initLocalStream,
    toggleVideo,
    toggleAudio,
    cleanup,
  } = useWebRTC(socket, ROOM_ID, true);

  // Initialize local stream on mount
  useEffect(() => {
    initLocalStream(camOn, micOn);
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Socket events
  useEffect(() => {
    socket.on("update-participant", setParticipantState);
    socket.on("meeting-status", data => setTime(data.time));
    socket.on("meeting-started", () => {
      setMeetingStarted(true);
    });
    socket.on("meeting-ended", () => {
      alert("Interview ended");
      setMeetingStarted(false);
      setTime(0);
    });

    return () => {
      socket.off("update-participant");
      socket.off("meeting-status");
      socket.off("meeting-started");
      socket.off("meeting-ended");
    };
  }, []);

  const toggleMic = () => {
    const newMicState = !micOn;
    setMicOn(newMicState);
    toggleAudio(newMicState);
    socket.emit("interviewer-toggle", { micOn: newMicState, camOn });
  };

  const toggleCam = () => {
    const newCamState = !camOn;
    setCamOn(newCamState);
    toggleVideo(newCamState);
    socket.emit("interviewer-toggle", { micOn, camOn: newCamState });
  };

  const sendQuestion = () => {
    if (!question.trim()) return;
    socket.emit("new-question", question);
    setQuestion("");
  };

  const startMeeting = () => {
    socket.emit("start-meeting");
  };

  const endMeeting = () => {
    socket.emit("end-meeting");
  };

  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="interviewer-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-info">
            <div className="user-avatar interviewer">
              <FaUserTie />
            </div>
            <div>
              <h1>Interviewer Dashboard</h1>
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="timer-section">
            <div className="timer">
              <FaClock className="timer-icon" />
              <span>{formatTime(time)}</span>
            </div>
          </div>
          
          <div className="meeting-controls">
            {!meetingStarted ? (
              <button className="start-meeting-btn" onClick={startMeeting}>
                <FaPlay className="btn-icon" />
                Start Interview
              </button>
            ) : (
              <button className="end-meeting-btn" onClick={endMeeting}>
                <FaStop className="btn-icon" />
                End Interview
              </button>
            )}
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
              <FaUserTie className="title-icon" />
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
                <span>Your Camera is Off</span>
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
              <FaUserGraduate className="title-icon" />
              <span>Participant</span>
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
            
            {/* Camera Off Overlay */}
            {(!remoteStream || !participantState.camOn) && (
              <div className="camera-off-overlay">
                <FaVideoSlash className="camera-off-icon" />
                <span>
                  {!remoteStream ? 'Waiting for participant...' : 'Participant camera is off'}
                </span>
              </div>
            )}

            {/* Mic Muted Indicator */}
            {remoteStream && participantState.camOn && !participantState.micOn && (
              <div className="mic-muted-indicator">
                <FaMicrophoneSlash />
                <span>Mic Muted</span>
              </div>
            )}
          </div>

          <div className="video-controls">
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Participant Camera:</span>
                <span className={`status-value ${participantState.camOn ? 'on' : 'off'}`}>
                  {participantState.camOn ? 'On' : 'Off'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Participant Microphone:</span>
                <span className={`status-value ${participantState.micOn ? 'on' : 'off'}`}>
                  {participantState.micOn ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Panel */}
      <div className="content-card question-panel">
        <div className="card-header">
          <FaQuestionCircle className="card-icon" />
          <h3>Send Questions to Participant</h3>
        </div>
        
        <div className="question-input-section">
          <textarea 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Type your question for the participant here..."
            className="question-textarea"
            rows="4"
          />
          
          <button 
            className={`send-button ${question.trim() ? 'active' : 'disabled'}`}
            onClick={sendQuestion}
            disabled={!question.trim()}
          >
            <FaPaperPlane className="send-icon" />
            Send Question
          </button>
        </div>

        {!meetingStarted && (
          <div className="meeting-hint">
            💡 Start the meeting to begin the interview session
          </div>
        )}
      </div>

      <style jsx>{`
        .interviewer-dashboard {
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

        .header-left {
          flex: 1;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .user-avatar.interviewer {
          background: linear-gradient(135deg, #e44d26, #f16529);
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

        .meeting-controls {
          display: flex;
          gap: 12px;
        }

        .start-meeting-btn, .end-meeting-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .start-meeting-btn {
          background: #48bb78;
          color: white;
        }

        .start-meeting-btn:hover {
          background: #38a169;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
        }

        .end-meeting-btn {
          background: #e53e3e;
          color: white;
        }

        .end-meeting-btn:hover {
          background: #c53030;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
        }

        .btn-icon {
          font-size: 14px;
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
          font-size: 18px;
        }

        .local-video .title-icon {
          color: #e44d26;
        }

        .remote-video .title-icon {
          color: #4299e1;
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

        .mic-muted-indicator {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(229, 62, 62, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
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
          background: #e53e3e;
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
          color: #e53e3e;
        }

        /* Question Panel */
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
          color: #e44d26;
          font-size: 20px;
        }

        .question-input-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-textarea {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s ease;
        }

        .question-textarea:focus {
          outline: none;
          border-color: #e44d26;
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
          background: #e44d26;
          color: white;
        }

        .send-button.disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        .send-button.active:hover {
          background: #c5371d;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(228, 77, 38, 0.3);
        }

        .meeting-hint {
          margin-top: 16px;
          padding: 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          color: #856404;
          font-size: 14px;
          text-align: center;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .interviewer-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 12px;
          }

          .status-info {
            flex-direction: column;
            gap: 8px;
          }

          .video-controls {
            flex-direction: column;
          }

          .question-input-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}