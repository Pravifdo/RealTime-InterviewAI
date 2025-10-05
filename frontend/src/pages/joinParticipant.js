import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import "../styles/JoinParticipant.css";

function JoinParticipant() {
  const [participantMicOn, setParticipantMicOn] = useState(true);
  const [participantCamOn, setParticipantCamOn] = useState(true);
  const [interviewerCamOn, setInterviewerCamOn] = useState(false);

  const participantVideoRef = useRef(null);
  const interviewerVideoRef = useRef(null);
  const participantStreamRef = useRef(null);

  // Participant camera & mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: participantCamOn, audio: participantMicOn })
      .then((stream) => {
        participantStreamRef.current = stream;
        if (participantVideoRef.current) participantVideoRef.current.srcObject = stream;
        window.localStorage.setItem("participantCamOn", participantCamOn);
        window.localStorage.setItem("participantMicOn", participantMicOn);
      })
      .catch(console.error);

    return () => {
      if (participantStreamRef.current) {
        participantStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [participantCamOn, participantMicOn]);

  // Simulate interviewer side
  useEffect(() => {
    const stored = window.localStorage.getItem("interviewerCamOn");
    const camOn = stored === "true";
    setInterviewerCamOn(camOn);

    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (interviewerVideoRef.current) interviewerVideoRef.current.srcObject = stream;
        })
        .catch(console.error);
    }
  }, []);

  const toggleMic = () => setParticipantMicOn(!participantMicOn);
  const toggleCam = () => setParticipantCamOn(!participantCamOn);

  return (
    <div className="join-container">
      <div className="video-column">
        <h3>Participant</h3>
        {participantCamOn ? (
          <video ref={participantVideoRef} autoPlay muted className="video-box" />
        ) : (
          <div className="video-box">Camera Off</div>
        )}

        <div className="controls">
          <button onClick={toggleMic} className={`control-btn ${participantMicOn ? "on" : "off"}`}>
            {participantMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button onClick={toggleCam} className={`control-btn ${participantCamOn ? "on" : "off"}`}>
            {participantCamOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>
      </div>

      <div className="video-column">
        <h3>Interviewer</h3>
        {interviewerCamOn ? (
          <video ref={interviewerVideoRef} autoPlay muted className="video-box" />
        ) : (
          <div className="video-box">Interviewer Camera Off</div>
        )}
      </div>
    </div>
  );
}

export default JoinParticipant;
