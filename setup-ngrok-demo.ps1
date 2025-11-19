# Quick Demo Setup Script
# This script helps you configure ngrok URLs quickly

Write-Host "🚀 Interview App - Ngrok Demo Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if servers are running
$backendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*backend*" }
$frontendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*frontend*" }

if (-not $backendRunning) {
    Write-Host "⚠️  Backend server not running!" -ForegroundColor Yellow
    Write-Host "   Run: cd backend\node; npm run dev" -ForegroundColor Gray
    Write-Host ""
}

if (-not $frontendRunning) {
    Write-Host "⚠️  Frontend server not running!" -ForegroundColor Yellow
    Write-Host "   Run: cd frontend; npm start" -ForegroundColor Gray
    Write-Host ""
}

# Step 1: Get backend ngrok URL
Write-Host "Step 1: Backend Ngrok Tunnel" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green
Write-Host "In a NEW terminal, run: ngrok http 5000" -ForegroundColor Yellow
Write-Host ""
$backendNgrokUrl = Read-Host "Enter your backend ngrok HTTPS URL (e.g., https://abc123.ngrok-free.app)"

if ($backendNgrokUrl -notlike "https://*") {
    Write-Host "❌ Error: URL must start with https://" -ForegroundColor Red
    exit 1
}

# Remove trailing slash if present
$backendNgrokUrl = $backendNgrokUrl.TrimEnd('/')

# Step 2: Update frontend .env.local
Write-Host ""
Write-Host "Step 2: Updating frontend configuration..." -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green

$envLocalPath = "frontend\.env.local"
$envContent = "# Ngrok Backend URL for Demo`nREACT_APP_BACKEND_URL=$backendNgrokUrl`n"

Set-Content -Path $envLocalPath -Value $envContent
Write-Host "✅ Created/Updated: $envLocalPath" -ForegroundColor Green
Write-Host "   REACT_APP_BACKEND_URL=$backendNgrokUrl" -ForegroundColor Gray
Write-Host ""

# Step 3: Restart frontend reminder
Write-Host "Step 3: Restart Frontend" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green
Write-Host "⚠️  You MUST restart the frontend for changes to take effect!" -ForegroundColor Yellow
Write-Host "   1. Go to frontend terminal" -ForegroundColor Gray
Write-Host "   2. Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host "   3. Run: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter when frontend has restarted..." -ForegroundColor Cyan
Read-Host

# Step 4: Frontend ngrok tunnel
Write-Host ""
Write-Host "Step 4: Frontend Ngrok Tunnel" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green
Write-Host "In ANOTHER terminal, run: ngrok http 3000" -ForegroundColor Yellow
Write-Host ""
$frontendNgrokUrl = Read-Host "Enter your frontend ngrok HTTPS URL (e.g., https://xyz789.ngrok-free.app)"

if ($frontendNgrokUrl -notlike "https://*") {
    Write-Host "❌ Error: URL must start with https://" -ForegroundColor Red
    exit 1
}

# Remove trailing slash
$frontendNgrokUrl = $frontendNgrokUrl.TrimEnd('/')

# Step 5: Display demo URLs
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 DEMO URLS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Interviewer (Supervisor Device):" -ForegroundColor Yellow
Write-Host "   $frontendNgrokUrl/joinInterview" -ForegroundColor White
Write-Host ""
Write-Host "Participant (After getting Room ID):" -ForegroundColor Yellow
Write-Host "   $frontendNgrokUrl/joinParticipant?room=ROOM_ID" -ForegroundColor White
Write-Host ""
Write-Host "Template Management:" -ForegroundColor Yellow
Write-Host "   $frontendNgrokUrl/templates" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   Backend:  $backendNgrokUrl" -ForegroundColor Gray
Write-Host "   Frontend: $frontendNgrokUrl" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • Keep all 4 terminals open (backend, frontend, 2 ngrok tunnels)" -ForegroundColor Gray
Write-Host "   • Ngrok free tunnels expire after 2 hours" -ForegroundColor Gray
Write-Host "   • Test on same device first before using 2 devices" -ForegroundColor Gray
Write-Host ""
