import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/InterviewerDashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function InterviewerDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Route protection: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch evaluations data
  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/evaluation`);
      if (response.data.success) {
        setEvaluations(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setLoading(false);
    }
  };

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
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <>
                <div className="card-container">
                  <div className="card">
                    <h3>Total Interviews Conducted</h3>
                    <p className="card-value">{evaluations.length}</p>
                  </div>
                  <div className="card">
                    <h3>Completed Interviews</h3>
                    <p className="card-value">{evaluations.filter(e => e.status === 'completed').length}</p>
                  </div>
                  <div className="card">
                    <h3>Average Score</h3>
                    <p className="card-value">
                      {evaluations.length > 0 
                        ? (evaluations.reduce((sum, e) => sum + (e.averageScore || 0), 0) / evaluations.length).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                
                {evaluations.length > 0 && (
                  <div className="recent-interviews">
                    <h2>Recent Interviews</h2>
                    <div className="interview-list">
                      {evaluations.slice(0, 5).map((evaluation, index) => (
                        <div key={index} className="interview-item">
                          <div className="interview-info">
                            <h4>{evaluation.participantName || 'Anonymous'}</h4>
                            <p>Room: {evaluation.roomId}</p>
                            <p>Questions: {evaluation.totalQuestions || 0}</p>
                            <p>Status: <span className={`status ${evaluation.status}`}>{evaluation.status}</span></p>
                          </div>
                          <div className="interview-score">
                            <div className="score-circle" style={{
                              background: evaluation.averageScore >= 70 ? '#48bb78' : 
                                         evaluation.averageScore >= 50 ? '#fbbf24' : '#f56565'
                            }}>
                              {(evaluation.averageScore || 0).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
