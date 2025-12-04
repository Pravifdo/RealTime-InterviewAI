import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaClock, FaUserTie, FaUserGraduate, FaPlay, FaStop, FaQuestionCircle, FaCopy, FaSignOutAlt } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import LoadTemplateByID from "../components/LoadTemplateByID";
import LiveEvaluationPanel from "../components/LiveEvaluationPanel";


// Use environment variable or fallback to localhost
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL, {
  transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
  forceNew: false
});

// Generate unique Room ID
const generateRoomID = () => {
  return 'room-' + Math.random().toString(36).substr(2, 9);
};

export default function JoinInterview() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [time, setTime] = useState(0);
  const [question, setQuestion] = useState("");
  const [participantState, setParticipantState] = useState({ camOn: true, micOn: true });
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [copied, setCopied] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [templateId, setTemplateId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Speech recognition hook for interviewer
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Update question when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  // Generate Room ID on mount
  useEffect(() => {
    const newRoomID = generateRoomID();
    setRoomID(newRoomID);
    
    // Generate full shareable link
    const participantLink = `${window.location.origin}/joinParticipant?room=${newRoomID}`;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 NEW INTERVIEW ROOM CREATED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Room ID:', newRoomID);
    console.log('🔗 Participant Link:', participantLink);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('� Share this link with the participant to join:');
    console.log('   ', participantLink);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, []);

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
  } = useWebRTC(socket, roomID, true);

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
      setTime(0);
    });
    socket.on("meeting-ended", () => {
      setMeetingStarted(false);
      setTime(0);
      cleanup();
      alert("Interview ended");
      setTimeout(() => {
        navigate('/interviewer');
      }, 500);
    });

    return () => {
      socket.off("update-participant");
      socket.off("meeting-status");
      socket.off("meeting-started");
      socket.off("meeting-ended");
    };
  }, []);

  // Local timer for real-time updates
  useEffect(() => {
    let interval;
    if (meetingStarted) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meetingStarted]);

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
    setMeetingStarted(true);
    setTime(0);
    socket.emit("start-meeting");
  };

  const endMeeting = () => {
    if (window.confirm('Are you sure you want to end the interview?')) {
      setMeetingStarted(false);
      setTime(0);
      socket.emit("end-meeting");
      cleanup();
      setTimeout(() => {
        navigate('/interviewer');
      }, 1000);
    }
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/interviewer');
  };

  const copyRoomID = () => {
    navigator.clipboard.writeText(roomID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyParticipantLink = () => {
    const participantLink = `${window.location.origin}/joinParticipant?room=${roomID}`;
    navigator.clipboard.writeText(participantLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="interviewer-dashboard">
      {/* Room ID Banner */}
      {roomID && (
        <div style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexWrap: 'wrap'
        }}>
          <span>🔑 Room ID:</span>
          <code style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '5px 15px',
            borderRadius: '5px',
            fontSize: '18px',
            letterSpacing: '1px'
          }}>{roomID}</code>
          <button 
            onClick={copyRoomID}
            style={{
              backgroundColor: copied ? '#2196F3' : 'white',
              color: copied ? 'white' : '#4CAF50',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            <FaCopy />
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
          <button 
            onClick={copyParticipantLink}
            style={{
              backgroundColor: copied ? '#2196F3' : 'white',
              color: copied ? 'white' : '#4CAF50',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            <FaCopy />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>
            📋 Share with participant
          </span>
        </div>
      )}
      
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
              <>
                <button className="end-meeting-btn" onClick={endMeeting}>
                  <FaStop className="btn-icon" />
                  End Interview
                </button>
                <button className="leave-meeting-btn" onClick={leaveMeeting}>
                  <FaSignOutAlt className="btn-icon" />
                  Leave
                </button>
              </>
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
          {/* Speech Recognition Controls */}
          {isSpeechSupported && (
            <div className="speech-controls">
              <button 
                className={`speech-button ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : startListening}
              >
                <FaMicrophone className="mic-icon" />
                {isListening ? 'Stop Speaking' : 'Start Speaking'}
                {isListening && <span className="listening-pulse"></span>}
              </button>
              {isListening && (
                <span className="listening-indicator">
                  🎤 Listening...
                </span>
              )}
              {interimTranscript && (
                <div className="interim-text">
                  <em>{interimTranscript}</em>
                </div>
              )}
            </div>
          )}

          <textarea 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Type your question or use voice input above..."
            className="question-textarea"
            rows="4"
          />
          
          <div className="button-group">
            {transcript && (
              <button 
                className="clear-button"
                onClick={resetTranscript}
              >
                Clear Text
              </button>
            )}
            <button 
              className={`send-button ${question.trim() ? 'active' : 'disabled'}`}
              onClick={sendQuestion}
              disabled={!question.trim()}
            >
              <FaPaperPlane className="send-icon" />
              Send Question
            </button>
          </div>
        </div>

        {!meetingStarted && (
          <div className="meeting-hint">
            💡 Start the meeting to begin the interview session
          </div>
        )}
      </div>

      {/* Load Template or Live Evaluation Panel */}
      {!setupComplete ? (
        <LoadTemplateByID 
          socket={socket} 
          roomID={roomID} 
          onTemplateLoaded={(questions, loadedTemplateId) => {
            setSavedQuestions(questions);
            setTemplateId(loadedTemplateId);
            setSetupComplete(true);
          }}
        />
      ) : (
        <LiveEvaluationPanel 
          socket={socket} 
          roomID={roomID} 
          savedQuestions={savedQuestions}
          templateId={templateId}
        />
      )}

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

        .leave-meeting-btn {
          background: #718096;
          color: white;
        }

        .leave-meeting-btn:hover {
          background: #4a5568;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(113, 128, 150, 0.3);
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

        /* Speech Recognition Controls */
        .speech-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #fff5f5;
          border-radius: 12px;
          border: 2px dashed #feb2b2;
        }

        .speech-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          background: #e44d26;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .speech-button:hover {
          background: #c93d1f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(228, 77, 38, 0.4);
        }

        .speech-button.listening {
          background: #f56565;
          animation: pulse 1.5s infinite;
        }

        .speech-button.listening:hover {
          background: #e53e3e;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(245, 101, 101, 0);
          }
        }

        .mic-icon {
          font-size: 20px;
        }

        .listening-pulse {
          position: absolute;
          right: 12px;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }

        .listening-indicator {
          color: #f56565;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeInOut 2s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .interim-text {
          padding: 12px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #fbbf24;
          font-size: 14px;
          color: #78716c;
          min-height: 40px;
        }

        .interim-text em {
          font-style: normal;
          color: #92400e;
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .clear-button {
          padding: 12px 24px;
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-button:hover {
          background: #cbd5e0;
          transform: translateY(-2px);
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
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .send-button.active {
          background: #e44d26;
          color: white;
        }

        .send-button.active:hover {
          background: #c93d1f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(228, 77, 38, 0.4);
        }

        .send-button.disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }
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