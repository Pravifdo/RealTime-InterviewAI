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
  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [participantAnswers, setParticipantAnswers] = useState([]);
  const [evaluatingIndex, setEvaluatingIndex] = useState(null);  // Track which answer is being evaluated

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const answersEndRef = useRef(null);

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

    // Listen for participant answers (direct answer - no evaluation yet)
    socket.on("participant-answer-received", (data) => {
      console.log('📨 Direct answer received from participant:', data);
      setParticipantAnswers(prev => {
        const updated = [...prev];
        // Store the answer with evaluated: false flag
        updated[data.questionIndex] = {
          answer: data.answer,
          questionIndex: data.questionIndex,
          timestamp: data.timestamp,
          evaluated: false,  // Not evaluated yet - show "Evaluate" button
          score: null,
          feedback: null
        };
        return updated;
      });
    });

    // Listen for participant answers submission confirmation
    socket.on("answer-submitted", (data) => {
      if (data.success) {
        console.log('✅ Participant submitted answer for Q' + (data.questionIndex + 1));
      }
    });

    // Listen for evaluation started (show loading state)
    socket.on("evaluation-started", (data) => {
      console.log('🔄 Evaluation started for Q' + (data.questionIndex + 1));
      setEvaluatingIndex(data.questionIndex);
    });

    // Listen for AI evaluation results
    socket.on("answer-evaluated", (data) => {
      console.log('📊 Answer evaluated by Gemini AI:', data);
      setEvaluatingIndex(null);  // Clear loading state
      setParticipantAnswers(prev => {
        const updated = [...prev];
        updated[data.questionIndex] = {
          ...updated[data.questionIndex],
          answer: data.answer || updated[data.questionIndex]?.answer || 'No answer provided',
          score: data.score,
          points: data.points,
          feedback: data.feedback,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          matchedConcepts: data.matchedConcepts || [],
          expectedKeywords: data.expectedKeywords || [],
          evaluated: true,
          questionIndex: data.questionIndex
        };
        return updated;
      });
    });

    // Listen for evaluation errors
    socket.on("evaluation-error", (data) => {
      console.error('❌ Evaluation error for Q' + (data.questionIndex + 1) + ':', data.error);
      setEvaluatingIndex(null);
      alert('Evaluation failed: ' + data.error);
    });

    return () => {
      socket.off("update-participant");
      socket.off("meeting-status");
      socket.off("meeting-started");
      socket.off("meeting-ended");
      socket.off("participant-answer-received");
      socket.off("answer-submitted");
      socket.off("evaluation-started");
      socket.off("answer-evaluated");
      socket.off("evaluation-error");
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

  // Auto-scroll to latest answer
  useEffect(() => {
    answersEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [participantAnswers]);

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
    
    // Add question to local state
    setQuestionsAsked(prev => [...prev, {
      question: question,
      timestamp: new Date(),
      index: prev.length
    }]);
    
    // Send question with roomId
    socket.emit("new-question", {
      question: question,
      roomId: roomID
    });
    
    setQuestion("");
    console.log('📤 Question sent to participant in room:', roomID);
  };

  // Evaluate answer using Gemini AI (on-demand)
  const evaluateAnswer = (questionIndex) => {
    const answerData = participantAnswers[questionIndex];
    const questionData = questionsAsked[questionIndex];
    
    if (!answerData || !answerData.answer) {
      alert('No answer to evaluate!');
      return;
    }
    
    console.log('🤖 Requesting AI evaluation for Q' + (questionIndex + 1));
    
    socket.emit('evaluate-answer', {
      roomId: roomID,
      questionIndex: questionIndex,
      answer: answerData.answer,
      question: questionData?.question || '',
      templateId: templateId
    });
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

      {/* Questions & Answers Display */}
      <div className="content-card qa-display-panel">
        <div className="card-header">
          <FaQuestionCircle className="card-icon" />
          <h3>Interview Questions & Answers</h3>
          <span className="qa-count">{questionsAsked.length} Questions Asked</span>
        </div>
        
        <div className="qa-list">
          {questionsAsked.length === 0 ? (
            <div className="empty-qa">
              <p>📝 No questions asked yet</p>
              <span>Send questions to the participant to start the interview</span>
            </div>
          ) : (
            questionsAsked.map((q, index) => (
              <div key={index} className="qa-item">
                <div className="question-section">
                  <div className="qa-label">
                    <span className="q-badge">Q{index + 1}</span>
                    <span className="timestamp">
                      {q.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="question-text">{q.question}</div>
                </div>
                
                {participantAnswers[index] ? (
                  <div className="answer-section">
                    <div className="answer-label">
                      <span className="a-badge">Answer</span>
                      {participantAnswers[index].evaluated && participantAnswers[index].score !== null && (
                        <>
                          <span className="score-badge" style={{
                            background: participantAnswers[index].score >= 70 ? '#48bb78' : 
                                        participantAnswers[index].score >= 50 ? '#ed8936' : '#f56565'
                          }}>
                            Score: {participantAnswers[index].score}%
                          </span>
                          <span className="points-badge">
                            {participantAnswers[index].points || Math.round(participantAnswers[index].score / 10)}/10 Points
                          </span>
                        </>
                      )}
                    </div>
                    <div className="answer-text">{participantAnswers[index].answer}</div>
                    
                    {/* Show Evaluate Button if not evaluated yet */}
                    {!participantAnswers[index].evaluated && (
                      <div className="evaluate-section">
                        <button 
                          className={`evaluate-btn ${evaluatingIndex === index ? 'evaluating' : ''}`}
                          onClick={() => evaluateAnswer(index)}
                          disabled={evaluatingIndex === index}
                        >
                          {evaluatingIndex === index ? (
                            <>
                              <span className="spinner"></span>
                              Evaluating with AI...
                            </>
                          ) : (
                            <>
                              🤖 Evaluate with Gemini AI
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Show AI Evaluation Results */}
                    {participantAnswers[index].evaluated && (
                      <div className="evaluation-results">
                        {/* Score Visualization */}
                        <div className="score-visual">
                          <div className="score-circle" style={{
                            background: `conic-gradient(
                              ${participantAnswers[index].score >= 70 ? '#48bb78' : 
                                participantAnswers[index].score >= 50 ? '#ed8936' : '#f56565'} 
                              ${participantAnswers[index].score * 3.6}deg, 
                              #e2e8f0 0deg
                            )`
                          }}>
                            <div className="score-inner">
                              <span className="score-number">{participantAnswers[index].score}</span>
                              <span className="score-label">%</span>
                            </div>
                          </div>
                          <div className="score-details">
                            <div className="detail-item">
                              <span className="detail-label">Points:</span>
                              <span className="detail-value">{participantAnswers[index].points || Math.round(participantAnswers[index].score / 10)}/10</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Status:</span>
                              <span className={`detail-value status-${participantAnswers[index].score >= 70 ? 'pass' : participantAnswers[index].score >= 50 ? 'fair' : 'fail'}`}>
                                {participantAnswers[index].score >= 70 ? '✅ Good' : 
                                 participantAnswers[index].score >= 50 ? '⚠️ Fair' : '❌ Needs Work'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Feedback */}
                        {participantAnswers[index].feedback && (
                          <div className="ai-feedback-box">
                            <strong>🤖 AI Feedback:</strong>
                            <p>{participantAnswers[index].feedback}</p>
                          </div>
                        )}
                        
                        {/* Strengths */}
                        {participantAnswers[index].strengths && participantAnswers[index].strengths.length > 0 && (
                          <div className="strengths-box">
                            <strong>✅ Strengths:</strong>
                            <ul>
                              {participantAnswers[index].strengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Improvements */}
                        {participantAnswers[index].improvements && participantAnswers[index].improvements.length > 0 && (
                          <div className="improvements-box">
                            <strong>📈 Areas to Improve:</strong>
                            <ul>
                              {participantAnswers[index].improvements.map((imp, i) => (
                                <li key={i}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Matched Concepts */}
                        {participantAnswers[index].matchedConcepts && participantAnswers[index].matchedConcepts.length > 0 && (
                          <div className="concepts-box">
                            <strong>🎯 Concepts Covered:</strong>
                            <div className="concepts-tags">
                              {participantAnswers[index].matchedConcepts.map((concept, i) => (
                                <span key={i} className="concept-tag">{concept}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="waiting-answer">
                    <span className="waiting-text">⏳ Waiting for participant's answer...</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={answersEndRef} />
        </div>
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
          onQuestionAsked={(questionData) => {
            setQuestionsAsked(prev => [...prev, questionData]);
          }}
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

        /* Questions & Answers Display Panel */
        .qa-display-panel {
          margin-top: 20px;
        }

        .qa-count {
          background: #e44d26;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .qa-list {
          max-height: 600px;
          overflow-y: auto;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
        }

        .empty-qa {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #a0aec0;
          text-align: center;
        }

        .empty-qa p {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .empty-qa span {
          font-size: 14px;
        }

        .qa-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .question-section {
          margin-bottom: 16px;
        }

        .qa-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .q-badge {
          background: #e44d26;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
        }

        .timestamp {
          color: #718096;
          font-size: 12px;
        }

        .question-text {
          padding: 12px;
          background: #fef5f1;
          border-left: 4px solid #e44d26;
          border-radius: 8px;
          color: #2d3748;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 500;
        }

        .answer-section {
          padding-top: 16px;
          border-top: 2px solid #e2e8f0;
        }

        .answer-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .a-badge {
          background: #48bb78;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
        }

        .score-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
        }

        .points-badge {
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
        }

        .answer-text {
          padding: 12px;
          background: #f0fff4;
          border-left: 4px solid #48bb78;
          border-radius: 8px;
          color: #2d3748;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        /* Evaluate Button Section */
        .evaluate-section {
          margin-top: 16px;
          text-align: center;
        }

        .evaluate-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .evaluate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .evaluate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .evaluate-btn.evaluating {
          background: #a0aec0;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Evaluation Results */
        .evaluation-results {
          margin-top: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .score-visual {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .score-inner {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .score-number {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .score-label {
          font-size: 14px;
          color: #718096;
        }

        .score-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-label {
          font-size: 14px;
          color: #718096;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .detail-value.status-pass {
          color: #48bb78;
        }

        .detail-value.status-fair {
          color: #ed8936;
        }

        .detail-value.status-fail {
          color: #f56565;
        }

        .ai-feedback-box {
          margin-top: 12px;
          padding: 12px;
          background: #ebf8ff;
          border-left: 4px solid #4299e1;
          border-radius: 8px;
        }

        .ai-feedback-box strong {
          color: #2c5282;
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .ai-feedback-box p {
          margin: 0;
          color: #2d3748;
          font-size: 13px;
          line-height: 1.5;
        }

        .strengths-box {
          margin-top: 12px;
          padding: 12px;
          background: #f0fff4;
          border-left: 4px solid #48bb78;
          border-radius: 8px;
        }

        .strengths-box strong {
          color: #276749;
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .strengths-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .strengths-box li {
          color: #2d3748;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .improvements-box {
          margin-top: 12px;
          padding: 12px;
          background: #fffbeb;
          border-left: 4px solid #ed8936;
          border-radius: 8px;
        }

        .improvements-box strong {
          color: #c05621;
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .improvements-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .improvements-box li {
          color: #2d3748;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .concepts-box {
          margin-top: 12px;
          padding: 12px;
          background: #faf5ff;
          border-left: 4px solid #805ad5;
          border-radius: 8px;
        }

        .concepts-box strong {
          color: #553c9a;
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .concepts-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .concept-tag {
          background: #e9d8fd;
          color: #553c9a;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .waiting-answer {
          padding: 20px;
          background: #fefcbf;
          border: 2px dashed #f6e05e;
          border-radius: 8px;
          text-align: center;
        }

        .waiting-text {
          color: #744210;
          font-size: 14px;
          font-weight: 600;
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