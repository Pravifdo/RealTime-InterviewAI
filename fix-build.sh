#!/bin/bash
# CRITICAL REBUILD SCRIPT - Run this on your server at 142.93.220.168
# This script properly rebuilds the frontend with the correct backend URL

echo "🔧 FIXING FRONTEND BUILD - Server IP: 142.93.220.168"
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
REACT_APP_BACKEND_URL=http://142.93.220.168:5000
EOF

# Create .env.production file (overrides .env for production build)
echo "📝 Creating .env.production file..."
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=http://142.93.220.168:5000
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
REACT_APP_BACKEND_URL=http://142.93.220.168:5000 npm run build

# Check if build succeeded
if [ -d "build" ]; then
    echo ""
    echo "✅ Build successful!"
    
    # Search in the built files to verify the IP
    echo ""
    echo "🔍 Verifying built files contain correct IP..."
    if grep -r "142.93.220.168" build/ > /dev/null; then
        echo "✅ Built files contain 142.93.220.168"
    else
        echo "❌ WARNING: Built files do NOT contain 142.93.220.168"
        echo "   Searching for what IP is in the build..."
        grep -r "BACKEND_URL\|localhost:5000\|178.128.59.218" build/ | head -5
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
    echo "   http://142.93.220.168:3000"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "   1. Clear your browser cache (Ctrl+Shift+R)"
    echo "   2. Or open in incognito/private window"
    echo "   3. Check browser console - should NOT see localhost errors"
    echo ""
    pm2 list
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the error messages above"
fi
