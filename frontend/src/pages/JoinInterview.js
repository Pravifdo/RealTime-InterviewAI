import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import "../styles/JoinInterview.css";

function JoinInterview() {
  const [interviewerMicOn, setInterviewerMicOn] = useState(true);
  const [interviewerCamOn, setInterviewerCamOn] = useState(true);
  const [participantCamOn, setParticipantCamOn] = useState(false);

  const interviewerVideoRef = useRef(null);
  const participantVideoRef = useRef(null);
  const interviewerStreamRef = useRef(null);

  // Interviewer camera & mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: interviewerCamOn, audio: interviewerMicOn })
      .then((stream) => {
        interviewerStreamRef.current = stream;
        if (interviewerVideoRef.current) interviewerVideoRef.current.srcObject = stream;
        window.localStorage.setItem("interviewerCamOn", interviewerCamOn);
        window.localStorage.setItem("interviewerMicOn", interviewerMicOn);
      })
      .catch(console.error);

    return () => {
      if (interviewerStreamRef.current) {
        interviewerStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [interviewerCamOn, interviewerMicOn]);

  // Simulate seeing participant
  useEffect(() => {
    const stored = window.localStorage.getItem("participantCamOn");
    const camOn = stored === "true";
    setParticipantCamOn(camOn);

    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (participantVideoRef.current) participantVideoRef.current.srcObject = stream;
        })
        .catch(console.error);
    }
  }, []);

  const toggleMic = () => setInterviewerMicOn(!interviewerMicOn);
  const toggleCam = () => setInterviewerCamOn(!interviewerCamOn);

  return (
    <div className="join-container">
      <div className="video-column">
        <h3>Interviewer</h3>
        {interviewerCamOn ? (
          <video ref={interviewerVideoRef} autoPlay muted className="video-box" />
        ) : (
          <div className="video-box">Camera Off</div>
        )}

        <div className="controls">
          <button onClick={toggleMic} className={`control-btn ${interviewerMicOn ? "on" : "off"}`}>
            {interviewerMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button onClick={toggleCam} className={`control-btn ${interviewerCamOn ? "on" : "off"}`}>
            {interviewerCamOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>
      </div>

      <div className="video-column">
        <h3>Participant</h3>
        {participantCamOn ? (
          <video ref={participantVideoRef} autoPlay muted className="video-box" />
        ) : (
          <div className="video-box">Participant Camera Off</div>
        )}
      </div>
    </div>
  );
}

export default JoinInterview;
