import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid, Card, CardContent } from '@mui/material';
import { 
  PlayArrow, 
  Assessment, 
  Videocam, 
  Feedback, 
  Security, 
  TrendingUp,
  Person,
  BusinessCenter,
  School
} from '@mui/icons-material';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: "AI-Powered Evaluation",
      description: "Real-time analysis of answers using advanced AI algorithms"
    },
    {
      icon: <Videocam sx={{ fontSize: 40 }} />,
      title: "Live Video Interviews",
      description: "Seamless video conferencing with crystal clear audio"
    },
    {
      icon: <Feedback sx={{ fontSize: 40 }} />,
      title: "Instant Feedback",
      description: "Get immediate feedback on your performance and areas for improvement"
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: "Performance Analytics",
      description: "Detailed insights and progress tracking over time"
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Secure & Private",
      description: "Enterprise-grade security for all your interview data"
    },
    {
      icon: <PlayArrow sx={{ fontSize: 40 }} />,
      title: "Real-time Scoring",
      description: "Live scoring on communication, technical skills, and more"
    }
  ];

  const userTypes = [
    {
      icon: <Person sx={{ fontSize: 50 }} />,
      title: "Job Seekers",
      description: "Practice and improve your interview skills with AI feedback",
      buttonText: "Start Practicing",
      onClick: () => navigate('/login')
    },
    {
      icon: <BusinessCenter sx={{ fontSize: 50 }} />,
      title: "Interviewers",
      description: "Conduct efficient interviews with AI-assisted evaluation",
      buttonText: "Start Interviewing",
      onClick: () => navigate('/login')
    },
    {
      icon: <School sx={{ fontSize: 50 }} />,
      title: "Training Institutes",
      description: "Enhance your curriculum with AI-powered interview training",
      buttonText: "Learn More",
      onClick: () => navigate('/register')
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <Container maxWidth="lg">
          <Box className="hero-content">
            <Typography 
              variant="h1" 
              component="h1" 
              className="hero-title"
              gutterBottom
            >
              Real-Time Interview
              <span className="gradient-text"> Evaluation System</span>
            </Typography>
            
            <Typography 
              variant="h4" 
              component="p" 
              className="hero-subtitle"
              gutterBottom
            >
              Transform Interviews with AI-Powered Real-Time Feedback and Analysis
            </Typography>
            
            <Typography 
              variant="h6" 
              className="hero-description"
              paragraph
            >
              Experience the future of interviewing with our cutting-edge AI platform. 
              Get instant evaluation, comprehensive analytics, and actionable insights 
              to make better hiring decisions or ace your next interview.
            </Typography>

            <Box className="hero-buttons">
              <Button
                variant="contained"
                size="large"
                className="cta-btn primary"
                onClick={() => navigate('/login')}
                startIcon={<PlayArrow />}
              >
                Get Started Now
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                className="cta-btn secondary"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </Box>

            <Box className="hero-stats">
              <Box className="stat-item">
                <Typography variant="h3" className="stat-number">
                  10K+
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Interviews Conducted
                </Typography>
              </Box>
              <Box className="stat-item">
                <Typography variant="h3" className="stat-number">
                  95%
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Accuracy Rate
                </Typography>
              </Box>
              <Box className="stat-item">
                <Typography variant="h3" className="stat-number">
                  50+
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Companies Trust Us
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container maxWidth="lg">
          <Box className="section-header" textAlign="center" mb={6}>
            <Typography variant="h2" component="h2" className="section-title" gutterBottom>
              Powerful Features
            </Typography>
            <Typography variant="h6" className="section-subtitle">
              Everything you need for modern, efficient interviews
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className="feature-card">
                  <CardContent className="feature-content">
                    <Box className="feature-icon">
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" className="feature-title" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* User Types Section */}
      <section className="users-section">
        <Container maxWidth="lg">
          <Box className="section-header" textAlign="center" mb={6}>
            <Typography variant="h2" component="h2" className="section-title" gutterBottom>
              Designed For Everyone
            </Typography>
            <Typography variant="h6" className="section-subtitle">
              Whether you're giving or taking interviews, we've got you covered
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {userTypes.map((user, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper elevation={2} className="user-card">
                  <Box className="user-icon">
                    {user.icon}
                  </Box>
                  <Typography variant="h5" component="h3" className="user-title" gutterBottom>
                    {user.title}
                  </Typography>
                  <Typography variant="body1" className="user-description" paragraph>
                    {user.description}
                  </Typography>
                  <Button
                    variant="contained"
                    className="user-btn"
                    onClick={user.onClick}
                    fullWidth
                  >
                    {user.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container maxWidth="md">
          <Paper elevation={0} className="cta-paper">
            <Box className="cta-content" textAlign="center">
              <Typography variant="h3" component="h2" className="cta-title" gutterBottom>
                Ready to Transform Your Interview Experience?
              </Typography>
              <Typography variant="h6" className="cta-subtitle" paragraph>
                Join thousands of users who are already making better hiring decisions 
                and improving their interview skills with our AI platform.
              </Typography>
              <Button
                variant="contained"
                size="large"
                className="cta-btn large"
                onClick={() => navigate('/register')}
              >
                Start Your Free Trial
              </Button>
            </Box>
          </Paper>
        </Container>
      </section>
    </div>
  );
}

export default Home;