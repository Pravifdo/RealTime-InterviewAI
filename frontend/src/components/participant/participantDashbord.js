import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./participantDashbord.css";

function ParticipantDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const navigate = useNavigate();

  // 🔹 Route protection: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login"); // redirect to login if no token
    }
  }, [navigate]);

  // 🔹 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    navigate("/Login"); // redirect to login
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">🎯 Participant</h2>

        <button
          className={`sidebar-btn ${activePage === "overview" ? "active" : ""}`}
          onClick={() => setActivePage("overview")}
        >
          📊 Overview
        </button>

        <button
          className={`sidebar-btn ${activePage === "interviews" ? "active" : ""}`}
          onClick={() => setActivePage("interviews")}
        >
          🎤 My Interviews
        </button>

        <button
          className={`sidebar-btn ${activePage === "performance" ? "active" : ""}`}
          onClick={() => setActivePage("performance")}
        >
          📈 Performance
        </button>

        <hr />

        {/* 🔴 Logout Button */}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activePage === "overview" && (
          <div>
            <h1>Dashboard Overview</h1>
            <div className="card-container">
              <div className="card">
                <h3>Final Average Score</h3>
                <p className="card-value">85%</p>
              </div>
              <div className="card">
                <h3>Hours Practiced</h3>
                <p className="card-value">120 hrs</p>
              </div>
            </div>
          </div>
        )}

        {activePage === "interviews" && (
          <div className="interview-section">
            <h1>My Interviews</h1>
            <p>View and join your scheduled interviews</p>

            <p className="sub-text">Ready to start an interview?</p>
            <div className="button-group">
              <button
                className="join-btn"
                onClick={() => navigate("/join-interview")}
              >
                🚀 Join Interview
              </button>

              <button
                className="schedule-btn"
                onClick={() => navigate("/schedule-interview")}
              >
                ➕ Schedule New Interview
              </button>
            </div>
          </div>
        )}

        {activePage === "performance" && (
          <div>
            <h1>Performance</h1>
            <div className="card">
              <p>📈 Performance graph will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantDashboard;
