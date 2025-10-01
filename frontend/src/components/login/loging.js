import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, 
  Alert, Box, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import axios from 'axios';
import '../styles/loging.css';

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
      alert('Login successful!');

      if (response.data.role === 'participant') {
        console.log('Participant logged in');
        navigate('/participant');
      } else if (response.data.role === 'interviewer') {
        console.log('Interviewer logged in');
        navigate('/interviewr');
      }
    } catch (err) {
      setError('Invalid email, password, or role');
    }
  };

  return (
    <Container maxWidth="xs" className="login-container">
      <Box className="login-box">
        <Typography variant="h4" align="center" gutterBottom className="login-title">
          InterviewAI
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
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
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

        <Typography variant="body2" align="center" className="demo-text">
          Demo credentials: Use any email and password
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
