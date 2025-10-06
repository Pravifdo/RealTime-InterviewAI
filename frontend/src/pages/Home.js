import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Container maxWidth="md">
        <Paper elevation={3} className="home-paper">
          <Box className="home-content">
            <Typography variant="h2" component="h1" className="home-title" gutterBottom>
              Welcome to InterviewAI
            </Typography>
            
            <Typography variant="h5" component="p" className="home-subtitle" gutterBottom>
              Your AI-Powered Interview Platform
            </Typography>
            
            <Typography variant="body1" className="home-description" paragraph>
              Enhance your interview skills with real-time AI evaluation and feedback.
              Whether you're preparing for your next big opportunity or conducting interviews,
              we've got you covered.
            </Typography>

            <Box className="home-buttons">
              <Button
                variant="contained"
                color="primary"
                size="large"
                className="home-btn login-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className="home-btn register-btn"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>

            <Box className="home-features" mt={4}>
              <Typography variant="h6" gutterBottom>
                Key Features:
              </Typography>
              <ul className="features-list">
                <li>Real-time AI-powered interview evaluation</li>
                <li>Comprehensive performance analytics</li>
                <li>Live video interviewing sessions</li>
                <li>Instant feedback and scoring</li>
              </ul>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default Home;
