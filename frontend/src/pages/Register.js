import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, 
  Alert, Box, ToggleButton, ToggleButtonGroup, Paper,
  InputAdornment, IconButton, Fade, LinearProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person,
  BusinessCenter,
  Email,
  Lock,
  PersonAdd,
  ArrowForward,
  Badge
} from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#f44336';
    if (passwordStrength < 75) return '#ff9800';
    return '#4caf50';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!role) {
      setError('Please select your role to continue');
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

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background Design Elements */}
      <div className="register-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <Container maxWidth="sm" className="register-container">
        <Fade in={true} timeout={800}>
          <Paper elevation={8} className="register-paper">
            <Box className="register-box">
              {/* Header Section */}
              <Box className="register-header">
                <Typography variant="h3" className="register-title" gutterBottom>
                  Join InterviewAI
                </Typography>
                <Typography variant="body1" className="register-subtitle">
                  Create your account and start your interview journey
                </Typography>
              </Box>

              {/* Role Selection */}
              <Box className="role-section">
                <Typography variant="h6" className="role-title">
                  I want to join as:
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
                    <Typography variant="caption" className="role-hint">
                      Practice & Improve
                    </Typography>
                  </ToggleButton>
                  <ToggleButton 
                    value="interviewer" 
                    className={`role-btn ${role === 'interviewer' ? 'selected' : ''}`}
                  >
                    <BusinessCenter className="role-icon" />
                    <span>Interviewer</span>
                    <Typography variant="caption" className="role-hint">
                      Conduct & Evaluate
                    </Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Alerts */}
              {error && (
                <Alert 
                  severity="error" 
                  className="register-alert"
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert 
                  severity="success" 
                  className="register-alert"
                >
                  {success}
                </Alert>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="register-form">
                <TextField
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  className="register-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge className="field-icon" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your full name"
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
                  className="register-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="field-icon" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your email address"
                />
                
                <Box className="password-section">
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
                    }}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    required
                    className="register-field"
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
                    placeholder="Create a strong password"
                  />
                  
                  {password && (
                    <Box className="password-strength">
                      <Box className="strength-bar">
                        <LinearProgress 
                          variant="determinate" 
                          value={passwordStrength} 
                          className="strength-progress"
                          sx={{
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getPasswordStrengthColor(),
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" className="strength-text">
                        Strength: <span style={{ color: getPasswordStrengthColor() }}>
                          {getPasswordStrengthText()}
                        </span>
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  className="register-field"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="field-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                          className="password-toggle"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Confirm your password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="register-btn"
                  disabled={!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !role || isLoading}
                  size="large"
                >
                  {isLoading ? (
                    <span className="loading-text">Creating Account...</span>
                  ) : (
                    <>
                      <PersonAdd className="btn-icon" />
                      <span>Create Account</span>
                      <ArrowForward className="btn-icon" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <Box className="divider-section">
                <div className="divider-line"></div>
                <Typography variant="body2" className="divider-text">
                  Already have an account?
                </Typography>
                <div className="divider-line"></div>
              </Box>

              {/* Login Link */}
              <Box className="login-section">
                <Button 
                  onClick={() => navigate('/login')} 
                  className="login-btn"
                  variant="outlined"
                  fullWidth
                  size="large"
                >
                  Sign In to Existing Account
                </Button>
              </Box>

              {/* Benefits Section */}
              <Box className="benefits-section">
                <Typography variant="h6" className="benefits-title">
                  Why Join InterviewAI?
                </Typography>
                <Box className="benefits-list">
                  <Box className="benefit-item">
                    <span className="benefit-icon">🚀</span>
                    <Typography variant="body2" className="benefit-text">
                      AI-powered real-time feedback
                    </Typography>
                  </Box>
                  <Box className="benefit-item">
                    <span className="benefit-icon">📊</span>
                    <Typography variant="body2" className="benefit-text">
                      Detailed performance analytics
                    </Typography>
                  </Box>
                  <Box className="benefit-item">
                    <span className="benefit-icon">💼</span>
                    <Typography variant="body2" className="benefit-text">
                      Professional interview practice
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </div>
  );
}

export default Register;