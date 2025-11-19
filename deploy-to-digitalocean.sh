#!/bin/bash

# Quick Deployment Script for Digital Ocean
# Run this ON YOUR DIGITAL OCEAN SERVER (178.128.59.218)

echo "🚀 Deploying Interview App to Digital Ocean..."
echo "================================================"

# Navigate to project directory
cd /home/RealTime-InterviewAI || { echo "❌ Project directory not found!"; exit 1; }

# Pull latest changes (if using git)
echo "📥 Pulling latest code..."
git pull origin main 2>/dev/null || echo "⚠️  Not a git repo or no changes"

echo ""
echo "📦 Setting up Backend..."
echo "------------------------"
cd backend/node

# Create/Update backend .env file
cat > .env << 'EOF'
PORT=5000
MONGO_URI=mongodb://localhost:27017/interview-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=your_gemini_api_key_if_available
NODE_ENV=production
EOF

echo "✅ Backend .env created"

# Install backend dependencies
npm install

# Stop existing backend process
pm2 delete interview-backend 2>/dev/null || echo "No existing backend to stop"

# Start backend with PM2
echo "🚀 Starting backend..."
pm2 start server.js --name interview-backend
pm2 save

echo ""
echo "🎨 Setting up Frontend..."
echo "-------------------------"
cd ../../frontend

# Create production .env for frontend
cat > .env.production << 'EOF'
# This gets baked into the React build
# Use the domain with HTTPS
REACT_APP_BACKEND_URL=https://project.praveenruchira.me
EOF

echo "✅ Frontend .env.production created"

# Install frontend dependencies
npm install

# Build frontend for production
echo "🔨 Building frontend... (this may take a few minutes)"
npm run build

# Stop existing frontend process
pm2 delete interview-frontend 2>/dev/null || echo "No existing frontend to stop"

# Serve the built frontend with PM2
echo "🚀 Starting frontend..."
pm2 serve build 3000 --name interview-frontend --spa
pm2 save

# Setup PM2 to start on reboot
pm2 startup

echo ""
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "📱 Access your app at:"
echo "   Frontend: https://project.praveenruchira.me"
echo "   Backend API: https://project.praveenruchira.me"
echo ""
echo "🔍 Useful commands:"
echo "   pm2 list                    - View all processes"
echo "   pm2 logs interview-backend  - View backend logs"
echo "   pm2 logs interview-frontend - View frontend logs"
echo "   pm2 restart all             - Restart all services"
echo ""
