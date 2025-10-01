import React from 'react';
import './App.css';
import Login from './components/login/loging';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ParticipantDashboard from './components/participant/participantDashbord';
import InterviewerDashboard from './components/interviewer/InterviewerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} /> {/* login route */}
        <Route path="/participant" element={<ParticipantDashboard />} />
        <Route path="/interviewer" element={<InterviewerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
