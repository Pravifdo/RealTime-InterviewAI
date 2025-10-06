import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, 
  Alert, Box, ToggleButton, ToggleButtonGroup, Paper 
} from '@mui/material';
import axios from 'axios';
import '../styles/Register.css';

function Register() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    setRole(newRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!role) {
      setError('Please select Participant or Interviewer');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { 
        name,
        email, 
        password, 
        role 
      });
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <Container maxWidth="sm" className="register-container">
        <Paper elevation={3} className="register-paper">
          <Box className="register-box">
            <Typography variant="h4" align="center" gutterBottom className="register-title">
              Create Account
            </Typography>
            
            <Typography variant="body2" align="center" className="register-subtitle">
              Join InterviewAI Today
            </Typography>

            {error && <Alert severity="error" className="register-alert">{error}</Alert>}
            {success && <Alert severity="success" className="register-alert">{success}</Alert>}
            
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
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
              />
              
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
              
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="register-btn"
                disabled={!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !role}
              >
                Register
              </Button>
            </form>

            <Box className="login-link-box">
              <Typography variant="body2" align="center">
                Already have an account?{' '}
                <Button 
                  onClick={() => navigate('/login')} 
                  className="login-link"
                  variant="text"
                >
                  Login here
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default Register;
