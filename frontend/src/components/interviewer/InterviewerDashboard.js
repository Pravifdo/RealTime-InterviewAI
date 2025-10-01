import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation
import "./interviewerDashbard.css";

function InterviewerDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const navigate = useNavigate(); // ✅ Initialize navigation

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
          className={`sidebar-btn ${activePage === "reviews" ? "active" : ""}`}
          onClick={() => setActivePage("reviews")}
        >
          📝 Reviews
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

        {activePage === "participants" && (
          <div>
            <h1>Participants</h1>
            {/* ✅ Button to go to Participants.js page */}
            <button
              className="go-btn"
              onClick={() => navigate("/participants")}
            >
              ➕ Go to Participants Page
            </button>
          </div>
        )}

        {activePage === "reviews" && (
          <div>
            <h1>Reviews</h1>
            <div className="card">
              <p>📝 Interview feedback and reviews will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewerDashboard;
