import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import "../styles/JoinParticipant.css";

function JoinParticipant() {
  const [participantMic, setParticipantMic] = useState(true);
  const [participantCam, setParticipantCam] = useState(true);
  const [answer, setAnswer] = useState("");
  const [sentAnswers, setSentAnswers] = useState([]);
  const [timer, setTimer] = useState(0);

  const participantVideoRef = useRef(null);
  const interviewerVideoRef = useRef(null);
  const participantStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Participant Camera & Mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: participantCam, audio: participantMic })
      .then((stream) => {
        participantStreamRef.current = stream;
        if (participantVideoRef.current)
          participantVideoRef.current.srcObject = stream;
      })
      .catch(console.error);

    return () => {
      if (participantStreamRef.current) {
        participantStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [participantCam, participantMic]);

  // Interviewer feed (simulated)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (interviewerVideoRef.current)
          interviewerVideoRef.current.srcObject = stream;
      })
      .catch(console.error);
  }, []);

  const handleSendAnswer = () => {
    if (!answer.trim()) return;
    setSentAnswers((prev) => [...prev, answer]);
    setAnswer("");
  };

  const handleEndInterview = () => {
    if (participantStreamRef.current)
      participantStreamRef.current.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    alert("Interview Ended");
  };

  return (
    <div className="join-container">
      {/* Participant Column */}
      <div className="video-column">
        <h3>Participant</h3>

        <div className="video-box">
          {participantCam ? (
            <video ref={participantVideoRef} autoPlay muted />
          ) : (
            <div>Camera Off</div>
          )}
        </div>

        <div className="controls">
          <button
            className={`control-btn ${participantMic ? "on" : "off"}`}
            onClick={() => setParticipantMic(!participantMic)}
          >
            {participantMic ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button
            className={`control-btn ${participantCam ? "on" : "off"}`}
            onClick={() => setParticipantCam(!participantCam)}
          >
            {participantCam ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>

        <div className="answer-section">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <div className="interview-footer">
            <button onClick={handleSendAnswer} className="control-btn on">
              Send
            </button>
            <button onClick={handleEndInterview} className="end-btn">
              End Interview
            </button>
            <span className="timer">{timer}s</span>
          </div>
        </div>
      </div>

      {/* Interviewer Column */}
      <div className="video-column">
        <h3>Interviewer</h3>
        <div className="video-box">
          <video ref={interviewerVideoRef} autoPlay muted />
        </div>
      </div>
    </div>
  );
}

export default JoinParticipant;
