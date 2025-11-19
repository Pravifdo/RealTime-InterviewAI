#!/bin/bash
# CRITICAL REBUILD SCRIPT - Run this on your server at 142.93.220.168
# This script properly rebuilds the frontend with the correct backend URL

echo "🔧 FIXING FRONTEND BUILD - Domain: project.praveenruchira.me"
echo "===================================================="

# Stop frontend first
echo "⏸️  Stopping frontend..."
pm2 stop frontend

# Navigate to frontend directory
cd /root/project/RealTime-InterviewAI/frontend || exit 1

# Delete old build
echo "🗑️  Removing old build..."
rm -rf build
rm -rf node_modules/.cache

# Create .env file (used during build)
echo "📝 Creating .env file..."
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://project.praveenruchira.me
EOF

# Create .env.production file (overrides .env for production build)
echo "📝 Creating .env.production file..."
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=https://project.praveenruchira.me
EOF

# Verify the files
echo ""
echo "📋 Verifying configuration files:"
echo "--------------------------------"
echo ".env contents:"
cat .env
echo ""
echo ".env.production contents:"
cat .env.production
echo ""

# Make sure dependencies are installed
echo "📦 Ensuring dependencies..."
npm install

# Build with explicit environment variable
echo ""
echo "🔨 Building frontend (this takes 1-2 minutes)..."
REACT_APP_BACKEND_URL=https://project.praveenruchira.me npm run build

# Check if build succeeded
if [ -d "build" ]; then
    echo ""
    echo "✅ Build successful!"
    
    # Search in the built files to verify the domain
    echo ""
    echo "🔍 Verifying built files contain correct domain..."
    if grep -r "project.praveenruchira.me" build/ > /dev/null; then
        echo "✅ Built files contain project.praveenruchira.me"
    else
        echo "❌ WARNING: Built files do NOT contain project.praveenruchira.me"
        echo "   Searching for what URL is in the build..."
        grep -r "BACKEND_URL\|localhost:5000\|142.93.220.168" build/ | head -5
    fi
    
    # Restart frontend
    echo ""
    echo "🚀 Restarting frontend..."
    pm2 delete frontend 2>/dev/null
    pm2 serve build 3000 --name frontend --spa
    pm2 save
    
    echo ""
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "===================================================="
    echo ""
    echo "📱 Access your app at:"
    echo "   https://project.praveenruchira.me"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "   1. Make sure DNS is pointed to 142.93.220.168"
    echo "   2. SSL certificate must be configured (nginx + Let's Encrypt)"
    echo "   3. Clear browser cache (Ctrl+Shift+R)"
    echo ""
    pm2 list
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the error messages above"
fi
