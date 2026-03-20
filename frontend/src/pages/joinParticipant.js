import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaClock, FaUserGraduate, FaUserTie, FaQuestionCircle, FaComment, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import "../styles/joinParticipant.css";

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

export default function JoinParticipant() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [time, setTime] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionTemplateIds, setQuestionTemplateIds] = useState({});  // Track templateId per question
  const [interviewerState, setInterviewerState] = useState({ camOn: true, micOn: true });
  const [roomID, setRoomID] = useState('');
  const [roomIDInput, setRoomIDInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Speech recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  
  // Update answer when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

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

  // Keep actual track state aligned with UI state if stream is recreated.
  useEffect(() => {
    if (!localStream) return;
    toggleAudio(micOn);
    toggleVideo(camOn);
  }, [localStream, micOn, camOn, toggleAudio, toggleVideo]);

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
    socket.on("meeting-status", data => setTime(data.time));
    socket.on("meeting-started", () => {
      setMeetingStarted(true);
      setTime(0);
    });
    socket.on("meeting-ended", () => {
      setMeetingStarted(false);
      setTime(0);
      cleanup();
      alert("Interview ended by interviewer. Redirecting to dashboard...");
      setTimeout(() => {
        navigate('/participant');
      }, 1500);
    });

    // Listen for questions asked during interview (new flow)
    socket.on("receive-question", (data) => {
      console.log('📝 New question received:', data);
      console.log('📝 Full data object:', JSON.stringify(data));
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      console.log('📝 New question received with templateId:', data.templateId);
      
      // Store templateId for this specific question
      if (data.templateId) {
        setQuestionTemplateIds(prev => {
          const updated = {
            ...prev,
            [data.questionIndex]: data.templateId
          };
          console.log('📋 Updated questionTemplateIds:', updated);
          return updated;
        });
        console.log('📋 Template ID stored for Q' + (data.questionIndex + 1) + ':', data.templateId);
      } else {
        console.warn('⚠️ No templateId in question data');
      }
      
      setQuestions(prev => {
        const updated = [...prev];
        updated[data.questionIndex] = data.question;
        return updated;
      });
    });

    // Listen for answer submission confirmation
    socket.on("answer-submitted", (data) => {
      if (data.success) {
        console.log('✅ Answer submitted successfully');
        // Store the templateId if returned (for future answers)
        if (data.templateId) {
          setQuestionTemplateIds(prev => ({
            ...prev,
            [data.questionIndex]: data.templateId
          }));
          console.log('📋 Template ID received from server:', data.templateId);
        }
        setAnswer('');
        resetTranscript();
      } else {
        console.error('❌ Error submitting answer:', data.error);
        alert('Error submitting answer: ' + data.error);
      }
    });

    // Legacy support for old flow
    socket.on("new-question", q => {
      console.log('📝 Question (old flow):', q);
      setQuestions(prev => [...prev, q]);
    });

    return () => {
      socket.off("update-interviewer");
      socket.off("new-question");
      socket.off("receive-question");
      socket.off("answer-submitted");
      socket.off("meeting-status");
      socket.off("meeting-started");
      socket.off("meeting-ended");
    };
  }, [resetTranscript]);

  // Local timer for participant - counts every second when meeting is active
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
    if (!newMicState && isListening) {
      stopListening();
    }
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
    
    const qIndex = currentQuestionIndex >= 0 ? currentQuestionIndex : questions.length - 1;
    const currentTemplateId = questionTemplateIds[qIndex];
    
    console.log('📊 Current state before submit:', {
      currentQuestionIndex,
      qIndex,
      questionsLength: questions.length,
      questionTemplateIds,
      currentTemplateId
    });
    
    const submissionData = {
      answer: answer.trim(),
      questionIndex: qIndex,
      roomId: roomID,
      templateId: currentTemplateId,
      question: currentQuestion || questions[qIndex]
    };
    
    console.log('📤 Submitting answer:', {
      questionIndex: submissionData.questionIndex,
      roomId: submissionData.roomId,
      templateId: submissionData.templateId,
      hasAnswer: !!submissionData.answer
    });
    
    // Use the new flow (submit-answer event)
    socket.emit("submit-answer", submissionData);
    
    // Also emit answer directly to interviewer for immediate display
    socket.emit("participant-answer", {
      answer: answer.trim(),
      questionIndex: qIndex,
      roomId: roomID,
      question: currentQuestion || questions[qIndex]
    });
    
    console.log('📤 Answer submitted for question', qIndex + 1);
    
    // Note: Answer will be cleared by the answer-submitted event listener
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

  const leaveMeeting = () => {
    if (window.confirm('Are you sure you want to leave the interview?')) {
      cleanup();
      navigate('/participant');
    }
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
          <button className="leave-meeting-btn" onClick={leaveMeeting}>
            <FaSignOutAlt className="btn-icon" />
            Leave Interview
          </button>
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
                  <div className="question-text">
                    {typeof q === 'string' ? q : (q?.question || JSON.stringify(q))}
                  </div>
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
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="Type your answer or use voice input above..."
              className="answer-textarea"
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
                className={`send-button ${answer.trim() ? 'active' : 'disabled'}`}
                onClick={sendAnswer}
                disabled={!answer.trim()}
              >
                <FaPaperPlane className="send-icon" />
                Send Answer
              </button>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="answer-hint">
              💡 You have {questions.length} question{questions.length > 1 ? 's' : ''} to answer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}