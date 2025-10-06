import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, 
  Alert, Box, ToggleButton, ToggleButtonGroup, Paper 
} from '@mui/material';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    setRole(newRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select Participant or Interviewer');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'participant') {
        navigate('/participant');
      } else if (response.data.role === 'interviewer') {
        navigate('/interviewer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email, password, or role');
    }
  };

  return (
    <div className="login-page">
      <Container maxWidth="sm" className="login-container">
        <Paper elevation={3} className="login-paper">
          <Box className="login-box">
            <Typography variant="h4" align="center" gutterBottom className="login-title">
              InterviewAI
            </Typography>
            
            <Typography variant="body2" align="center" className="login-subtitle">
              Sign in to continue
            </Typography>

            {error && <Alert severity="error" className="login-error">{error}</Alert>}
            
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              fullWidth
              className="role-toggle"
            >
              <ToggleButton value="participant">Participant</ToggleButton>
              <ToggleButton value="interviewer">Interviewer</ToggleButton>
            </ToggleButtonGroup>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="login-btn"
                disabled={!email.trim() || !password.trim() || !role}
              >
                Login
              </Button>
            </form>

            <Box className="register-link-box">
              <Typography variant="body2" align="center">
                Don't have an account?{' '}
                <Button 
                  onClick={() => navigate('/register')} 
                  className="register-link"
                  variant="text"
                >
                  Register here
                </Button>
              </Typography>
            </Box>

            <Typography variant="body2" align="center" className="demo-text">
              Demo credentials: Use any email and password
            </Typography>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default Login;
