import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/InterviewerDashboard.css";

function InterviewerDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const navigate = useNavigate();

  // Route protection: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Interviewer</h2>
        <button
          className={`sidebar-btn ${activePage === "overview" ? "active" : ""}`}
          onClick={() => setActivePage("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`sidebar-btn ${activePage === "participants" ? "active" : ""}`}
          onClick={() => setActivePage("participants")}
        >
          👨‍🎓 Participants
        </button>
        <button
          className={`sidebar-btn ${activePage === "interviews" ? "active" : ""}`}
          onClick={() => setActivePage("interviews")}
        >
          🎯 Interviews
        </button>
        <button
          className={`sidebar-btn ${activePage === "reviews" ? "active" : ""}`}
          onClick={() => setActivePage("reviews")}
        >
          📝 Reviews
        </button>

        <hr />

        {/* Logout Button */}
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
                <h3>Total Interviews Conducted</h3>
                <p className="card-value">15</p>
              </div>
              <div className="card">
                <h3>Participants Rated</h3>
                <p className="card-value">12</p>
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
                onClick={() => navigate("/JoinInterview")}
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

        {activePage === "participants" && (
          <div>
            <h1>Participants</h1>
            <p>All registered participants will appear here.</p>
          </div>
        )}

        {activePage === "reviews" && (
          <div>
            <h1>Reviews</h1>
            <div className="card">
              <p>📝 Interview feedback and reviews will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewerDashboard;
