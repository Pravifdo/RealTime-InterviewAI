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
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
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

        {/* Remote Video (Participant) */}
        <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Participant's Camera
          </div>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>Cam: {participantState.camOn ? '✅ On' : '❌ Off'}</span>
            <span>Mic: {participantState.micOn ? '✅ On' : '❌ Off'}</span>
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
