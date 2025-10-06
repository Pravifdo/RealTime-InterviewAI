import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import "../styles/JoinInterview.css";

function JoinInterview() {
  const [interviewerMicOn, setInterviewerMicOn] = useState(true);
  const [interviewerCamOn, setInterviewerCamOn] = useState(true);
  const [answer, setAnswer] = useState("");
  const [time, setTime] = useState(0); // Timer in seconds
  const [interviewEnded, setInterviewEnded] = useState(false);

  const participantVideoRef = useRef(null);
  const interviewerVideoRef = useRef(null);
  const participantStreamRef = useRef(null);
  const interviewerStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Participant video (always on)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        participantStreamRef.current = stream;
        if (participantVideoRef.current) participantVideoRef.current.srcObject = stream;
      })
      .catch(console.error);

    return () => {
      if (participantStreamRef.current) {
        participantStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Interviewer video (toggleable)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: interviewerCamOn, audio: interviewerMicOn })
      .then((stream) => {
        interviewerStreamRef.current = stream;
        if (interviewerVideoRef.current) interviewerVideoRef.current.srcObject = stream;
      })
      .catch(console.error);

    return () => {
      if (interviewerStreamRef.current) {
        interviewerStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [interviewerCamOn, interviewerMicOn]);

  // Timer
  useEffect(() => {
    if (!interviewEnded) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [interviewEnded]);

  const toggleInterviewerMic = () => setInterviewerMicOn(!interviewerMicOn);
  const toggleInterviewerCam = () => setInterviewerCamOn(!interviewerCamOn);
  const handleSubmit = () => {
    if (answer.trim() === "") return;
    alert("Answer submitted: " + answer);
    setAnswer("");
  };
  const handleEndInterview = () => {
    setInterviewEnded(true);
    alert("Interview Ended!");
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="join-container">
      {/* Interviewer Column */}
      <div className="video-column">
        <h3>Interviewer</h3>
        {interviewerCamOn ? (
          <video ref={interviewerVideoRef} autoPlay muted className="video-box" />
        ) : (
          <div className="video-box">Camera is Off</div>
        )}

        <div className="controls">
          <button
            onClick={toggleInterviewerMic}
            className={`control-btn ${interviewerMicOn ? "on" : "off"}`}
          >
            {interviewerMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button
            onClick={toggleInterviewerCam}
            className={`control-btn ${interviewerCamOn ? "on" : "off"}`}
          >
            {interviewerCamOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>

        <div className="interview-footer">
          <span className="timer">Time: {formatTime(time)}</span>
          <button className="end-btn" onClick={handleEndInterview}>
            End Interview
          </button>
        </div>
      </div>

      {/* Participant Column */}
      <div className="video-column">
        <h3>Participant</h3>
        <video ref={participantVideoRef} autoPlay muted className="video-box" />

        <div className="answer-section">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button onClick={handleSubmit} className="submit-btn">
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinInterview;
