import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { io } from "socket.io-client";
import { useWebRTC } from "../hooks/useWebRTC";

const socket = io("http://localhost:5000");
const ROOM_ID = "interview-room"; // You can make this dynamic based on session ID

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
        
        // Log video element state
        console.log('Video element readyState:', videoElement.readyState);
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
  }, [remoteStream]);  // Socket events
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🧑‍💼 Interviewer Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⏱ {formatTime(time)}</span>
          {!meetingStarted ? (
            <button 
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              onClick={startMeeting}
            >
              Start Interview
            </button>
          ) : (
            <button 
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              onClick={endMeeting}
            >
              End Interview
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '15px', border: '2px solid red', borderRadius: '5px', marginBottom: '20px', backgroundColor: '#ffe6e6' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Local Video (Interviewer) */}
        <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Your Camera</span>
            {isConnected && <span style={{ color: 'green' }}>● Connected</span>}
          </div>
          <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline
              style={{ 
                width: '100%', 
                borderRadius: '8px', 
                backgroundColor: '#000',
                display: camOn ? 'block' : 'none'
              }}
            />
            {!camOn && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '300px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <FaVideoSlash style={{ fontSize: '48px', marginBottom: '10px', color: '#666' }} />
                <p style={{ margin: 0, color: '#999' }}>Camera Off</p>
              </div>
            )}
          </div>
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

        {/* Remote Video (Participant) */}
        <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Participant's Camera {remoteStream && <span style={{ fontSize: '12px', color: 'green' }}>● Stream Active</span>}
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
                objectFit: 'cover',
                display: remoteStream ? 'block' : 'none'
              }}
            />
            {/* Show overlay when camera is off OR no stream */}
            {(!remoteStream || !participantState.camOn) && (
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
                color: '#fff',
                zIndex: 2
              }}>
                <FaVideoSlash style={{ fontSize: '48px', marginBottom: '10px', color: '#666' }} />
                <p style={{ margin: 0, color: '#999' }}>
                  {!remoteStream ? 'Waiting for participant...' : 'Participant\'s Camera Off'}
                </p>
              </div>
            )}
            {/* Show mic muted indicator when mic is off but camera is on */}
            {remoteStream && participantState.camOn && !participantState.micOn && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(220, 53, 69, 0.9)',
                borderRadius: '50%',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3
              }}>
                <FaMicrophoneSlash style={{ fontSize: '24px', color: 'white' }} />
              </div>
            )}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>Cam: {participantState.camOn ? '✅ On' : '❌ Off'}</span>
            <span>Mic: {participantState.micOn ? '✅ On' : '❌ Off'}</span>
            {remoteStream && (
              <span style={{ fontSize: '11px', color: '#666' }}>
                Tracks: {remoteStream.getTracks().filter(t => t.kind === 'video').length}V/{remoteStream.getTracks().filter(t => t.kind === 'audio').length}A
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Panel */}
      <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '15px', backgroundColor: '#f9f9f9' }}>
        <h3>📝 Send Question to Participant</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <textarea 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Type your question here..."
            rows="3"
            style={{ flex: 1, padding: '10px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: question.trim() ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: question.trim() ? 'pointer' : 'not-allowed',
              height: '80px'
            }}
            onClick={sendQuestion}
            disabled={!question.trim()}
          >
            Send Question
          </button>
        </div>
      </div>
    </div>
  );
}
