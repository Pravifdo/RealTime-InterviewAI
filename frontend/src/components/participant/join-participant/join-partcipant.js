import React, { useState, useEffect, useRef } from "react";
import "./join-partcipant.css";

function JoinParticipant() {
  const [participantMic, setParticipantMic] = useState(true);
  const [participantCam, setParticipantCam] = useState(true);
  const [interviewerMic, setInterviewerMic] = useState(true);
  const [interviewerCam, setInterviewerCam] = useState(true);
  const [answer, setAnswer] = useState("");
  const [sentAnswers, setSentAnswers] = useState([]);
  const [timer, setTimer] = useState(0);

  const participantVideoRef = useRef(null);
  const interviewerVideoRef = useRef(null);
  const participantStreamRef = useRef(null);
  const interviewerStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Participant Camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: participantCam, audio: participantMic })
      .then((stream) => {
        participantStreamRef.current = stream;
        if (participantVideoRef.current) participantVideoRef.current.srcObject = stream;
      })
      .catch(console.error);

    return () => {
      if (participantStreamRef.current) {
        participantStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [participantCam, participantMic]);

  // Interviewer Camera (simulated, you can replace with real feed)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: interviewerCam, audio: interviewerMic })
      .then((stream) => {
        interviewerStreamRef.current = stream;
        if (interviewerVideoRef.current) interviewerVideoRef.current.srcObject = stream;
      })
      .catch(console.error);

    return () => {
      if (interviewerStreamRef.current) {
        interviewerStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewerCam, interviewerMic]);

  const handleSendAnswer = () => {
    if (!answer.trim()) return;
    setSentAnswers((prev) => [...prev, answer]);
    setAnswer("");
  };

  const handleEndInterview = () => {
    if (participantStreamRef.current) participantStreamRef.current.getTracks().forEach((t) => t.stop());
    if (interviewerStreamRef.current) interviewerStreamRef.current.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    alert("Interview Ended");
  };

  return (
    <div className="join-container">
      {/* Left: Participant */}
      <div className="left-column">
        <h3>Participant</h3>
        {participantCam ? (
          <video ref={participantVideoRef} autoPlay muted />
        ) : (
          <div className="camera-off">Camera Off</div>
        )}
        <div className="controls">
          <button onClick={() => setParticipantMic(!participantMic)}>
            {participantMic ? "Mic On" : "Mic Off"}
          </button>
          <button onClick={() => setParticipantCam(!participantCam)}>
            {participantCam ? "Cam On" : "Cam Off"}
          </button>
        </div>
      </div>

      {/* Right: Interviewer + Answers */}
      <div className="right-column">
        {/* Top: Interviewer Video */}
        <div className="interviewer-section">
          <h3>Interviewer</h3>
          {interviewerCam ? (
            <video ref={interviewerVideoRef} autoPlay muted />
          ) : (
            <div className="camera-off">Camera Off</div>
          )}
          <div className="controls">
            <button onClick={() => setInterviewerMic(!interviewerMic)}>
              {interviewerMic ? "Mic On" : "Mic Off"}
            </button>
            <button onClick={() => setInterviewerCam(!interviewerCam)}>
              {interviewerCam ? "Cam On" : "Cam Off"}
            </button>
          </div>
        </div>

        {/* Bottom: Sent Answers */}
        <div className="answers-section">
          <h3>Sent Answers</h3>
          <div className="answers-list">
            {sentAnswers.map((ans, idx) => (
              <div key={idx} className="answer-item">{ans}</div>
            ))}
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button onClick={handleSendAnswer}>Send Answer</button>
          <button className="end-btn" onClick={handleEndInterview}>End Interview</button>
          <p className="timer">Timer: {timer}s</p>
        </div>
      </div>
    </div>
  );
}

export default JoinParticipant;
