import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";

const socket = io("http://localhost:5000");
const ROOM_ID = "interview-room"; // Same room as interviewer

export default function JoinParticipant() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [time, setTime] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [interviewerState, setInterviewerState] = useState({ camOn: true, micOn: true });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize WebRTC (participant is NOT the initiator)
  const {
    localStream,
    remoteStream,
    isConnected,
    error,
    initLocalStream,
    toggleVideo,
    toggleAudio,
    cleanup,
  } = useWebRTC(socket, ROOM_ID, false);

  // Initialize local stream on mount
  useEffect(() => {
    initLocalStream(camOn, micOn);

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('Setting local video stream');
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update remote video element
  useEffect(() => {
    console.log('🔄 Remote stream updated:', remoteStream);
    if (remoteVideoRef.current) {
      if (remoteStream) {
        console.log('✅ Setting remote video stream to element');
        const tracks = remoteStream.getTracks();
        console.log('Remote stream tracks:', tracks.map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })));
        
        // Set the stream
        remoteVideoRef.current.srcObject = remoteStream;
        
        // Add event listeners for debugging
        const videoElement = remoteVideoRef.current;
        
        videoElement.onloadedmetadata = () => {
          console.log('✅ Remote video metadata loaded');
          console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        };
        
        videoElement.onplay = () => {
          console.log('▶️ Remote video started playing');
        };
        
        videoElement.onerror = (e) => {
          console.error('❌ Remote video error:', e);
        };
        
        // Log video element properties
        console.log('Video element ready state:', videoElement.readyState);
        console.log('Video element paused:', videoElement.paused);
        
        // Force play in case autoplay is blocked
        videoElement.play().catch(err => {
          console.error('❌ Error playing remote video:', err);
        });
      } else {
        console.log('⚠️ Remote stream is null, clearing video element');
        remoteVideoRef.current.srcObject = null;
      }
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

  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🧑‍🎓 Participant Dashboard</h2>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          ⏱ {formatTime(time)}
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '15px', border: '2px solid red', borderRadius: '5px', marginBottom: '20px', backgroundColor: '#ffe6e6' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Local Video (Participant) */}
        <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Your Camera</span>
            {isConnected && <span style={{ color: 'green' }}>● Connected</span>}
          </div>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
            <button 
              style={{ 
                padding: '10px 15px', 
                backgroundColor: micOn ? '#007bff' : '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onClick={toggleMic}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button 
              style={{ 
                padding: '10px 15px', 
                backgroundColor: camOn ? '#007bff' : '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onClick={toggleCam}
              title={camOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {camOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
          </div>
        </div>

        {/* Remote Video (Interviewer) */}
        <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Interviewer's Camera {remoteStream && <span style={{ fontSize: '12px', color: 'green' }}>● Stream Active</span>}
          </div>
          <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              controls={false}
              style={{ 
                width: '100%', 
                borderRadius: '8px', 
                backgroundColor: '#000', 
                minHeight: '300px',
                objectFit: 'cover'
              }}
            />
            {!remoteStream && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <FaVideoSlash style={{ fontSize: '48px', marginBottom: '10px', color: '#666' }} />
                <p style={{ margin: 0, color: '#999' }}>Waiting for interviewer...</p>
              </div>
            )}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>Cam: {interviewerState.camOn ? '✅ On' : '❌ Off'}</span>
            <span>Mic: {interviewerState.micOn ? '✅ On' : '❌ Off'}</span>
            {remoteStream && (
              <span style={{ fontSize: '11px', color: '#666' }}>
                Tracks: {remoteStream.getTracks().filter(t => t.kind === 'video').length}V/{remoteStream.getTracks().filter(t => t.kind === 'audio').length}A
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '20px' }}>
        <h3>📋 Questions from Interviewer</h3>
        {questions.length === 0 ? (
          <p style={{ color: '#666' }}>No questions yet...</p>
        ) : (
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ padding: '10px', marginBottom: '10px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #ddd' }}>
                <strong>Q{i + 1}:</strong> {q}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Panel */}
      <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '15px', backgroundColor: '#f9f9f9' }}>
        <h3>✍️ Send Answer to Interviewer</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <textarea 
            value={answer} 
            onChange={e => setAnswer(e.target.value)} 
            placeholder="Type your answer here..."
            rows="3"
            style={{ flex: 1, padding: '10px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: answer.trim() ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: answer.trim() ? 'pointer' : 'not-allowed',
              height: '80px'
            }}
            onClick={sendAnswer}
            disabled={!answer.trim()}
          >
            Send Answer
          </button>
        </div>
      </div>
    </div>
  );
}
