import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import pages using the index file for cleaner imports
import {
  Home,
  Login,
  Register,
  ParticipantDashboard,
  InterviewerDashboard,
  JoinInterview
} from './pages';
import JoinParticipant from './pages/joinParticipant';
import TemplateManagement from './pages/TemplateManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/participant" element={<ParticipantDashboard />} />
        <Route path="/interviewer" element={<InterviewerDashboard />} />
        <Route path="/joinParticipant" element={<JoinParticipant />} />
        <Route path="/JoinInterview" element={<JoinInterview />} />
        <Route path="/templates" element={<TemplateManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
