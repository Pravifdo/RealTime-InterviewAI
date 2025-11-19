import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, 
  Alert, Box, ToggleButton, ToggleButtonGroup, Paper,
  InputAdornment, IconButton, Fade
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person,
  BusinessCenter,
  Email,
  Lock,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select your role to continue');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { 
        email, 
        password, 
        role 
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate based on role
      if (response.data.role === 'participant') {
        navigate('/participant');
      } else if (response.data.role === 'interviewer') {
        navigate('/interviewer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email, password, or role selection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Design Elements */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <Container maxWidth="sm" className="login-container">
        <Fade in={true} timeout={800}>
          <Paper elevation={8} className="login-paper">
            <Box className="login-box">
              {/* Header Section */}
              <Box className="login-header">
                <Typography variant="h3" className="login-title" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="body1" className="login-subtitle">
                  Sign in to your InterviewAI account
                </Typography>
              </Box>

              {/* Role Selection */}
              <Box className="role-section">
                <Typography variant="h6" className="role-title">
                  I am a:
                </Typography>
                <ToggleButtonGroup
                  value={role}
                  exclusive
                  onChange={handleRoleChange}
                  fullWidth
                  className="role-toggle"
                >
                  <ToggleButton 
                    value="participant" 
                    className={`role-btn ${role === 'participant' ? 'selected' : ''}`}
                  >
                    <Person className="role-icon" />
                    <span>Participant</span>
                  </ToggleButton>
                  <ToggleButton 
                    value="interviewer" 
                    className={`role-btn ${role === 'interviewer' ? 'selected' : ''}`}
                  >
                    <BusinessCenter className="role-icon" />
                    <span>Interviewer</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  className="login-error"
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  className="login-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="field-icon" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your email address"
                />
                
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  className="login-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="field-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          className="password-toggle"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="login-btn"
                  disabled={!email.trim() || !password.trim() || !role || isLoading}
                  size="large"
                >
                  {isLoading ? (
                    <span className="loading-text">Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowForward className="btn-icon" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <Box className="divider-section">
                <div className="divider-line"></div>
                <Typography variant="body2" className="divider-text">
                  New to InterviewAI?
                </Typography>
                <div className="divider-line"></div>
              </Box>

              {/* Register Link */}
              <Box className="register-section">
                <Button 
                  onClick={() => navigate('/register')} 
                  className="register-btn"
                  variant="outlined"
                  fullWidth
                  size="large"
                >
                  Create New Account
                </Button>
              </Box>

              {/* Demo Info */}
              <Box className="demo-section">
                <Typography variant="caption" className="demo-text">
                  💡 Demo: Use any email and password with your role selection
                </Typography>
              </Box>

              {/* Features Hint */}
              <Box className="features-hint">
                <Typography variant="caption" className="features-text">
                  ✨ AI-powered interviews • Real-time evaluation • Live feedback
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </div>
  );
}

export default Login;