import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ParticipantDashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function ParticipantDashboard() {
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
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/evaluation/my-evaluations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

        {/* Logout Button */}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activePage === "overview" && (
          <div>
            <h1>Your Performance Overview</h1>
            {loading ? (
              <p>Loading your data...</p>
            ) : (
              <>
                <div className="card-container">
                  <div className="card">
                    <h3>Interviews Completed</h3>
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
                  <div className="card">
                    <h3>Total Questions Answered</h3>
                    <p className="card-value">
                      {evaluations.reduce((sum, e) => sum + (e.totalQuestions || 0), 0)}
                    </p>
                  </div>
                </div>

                {evaluations.length > 0 && (
                  <div className="interview-history">
                    <h2>Your Interview History</h2>
                    <div className="history-list">
                      {evaluations.map((evaluation, index) => (
                        <div key={index} className="history-item">
                          <div className="history-header">
                            <h4>Room: {evaluation.roomId}</h4>
                            <span className={`status ${evaluation.status}`}>{evaluation.status}</span>
                          </div>
                          <div className="history-body">
                            <div className="history-stat">
                              <span className="stat-label">Score:</span>
                              <span className="stat-value" style={{
                                color: evaluation.averageScore >= 70 ? '#48bb78' : 
                                       evaluation.averageScore >= 50 ? '#fbbf24' : '#f56565'
                              }}>
                                {(evaluation.averageScore || 0).toFixed(1)}%
                              </span>
                            </div>
                            <div className="history-stat">
                              <span className="stat-label">Questions:</span>
                              <span className="stat-value">{evaluation.totalQuestions || 0}</span>
                            </div>
                            <div className="history-stat">
                              <span className="stat-label">Answered:</span>
                              <span className="stat-value">{evaluation.questionsAnswered || 0}</span>
                            </div>
                          </div>
                          {evaluation.questionsAnswers && evaluation.questionsAnswers.length > 0 && (
                            <div className="ai-feedback-summary">
                              <h5>Latest Feedback:</h5>
                              <p>{evaluation.questionsAnswers[evaluation.questionsAnswers.length - 1].aiFeedback || 'No feedback available'}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evaluations.length === 0 && (
                  <div className="no-data">
                    <p>You haven't completed any interviews yet. Start your first interview to see your performance data!</p>
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
                onClick={() => navigate("/joinParticipant")}
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
